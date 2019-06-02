from flask import Flask, jsonify, make_response, request
import logging
import MySQLdb

INSTANCE_NAME = 'tsflo-242417:us-east1:predict-db'
DB_NAME = 'population_db'
DB_USER = 'firstUser'
DB_PASS = '0'

app = Flask(__name__)

def getDB():
  return MySQLdb.connect(unix_socket='/cloudsql/' + INSTANCE_NAME, db=DB_NAME, user=DB_USER, passwd=DB_PASS, charset='utf8')

def cursorOutput(fetchall):
  return [[b for b in a] for a in fetchall]

@app.route('/', methods=['GET'])
def default():
  return "Hi"

@app.route('/predict/getPopulation/<date>', methods=['GET'])
def getPopulation(date):
  # print(date)
  db = getDB()
  cursor = db.cursor()
  cursor.execute('SELECT * FROM PopulationPrediction;')
  # print("hi")
  cursor.execute('SELECT MAX(date) FROM PopulationPrediction WHERE date <= \'%s\'' %(date))
  maxDate = cursorOutput(cursor.fetchall())[0][0]
  # print("MaxDate: ", maxDate)
  # print('SELECT roomId, secondsSinceLastEmpty, numberOfPeople FROM PopulationPrediction WHERE date = \'%s\'' %(maxDate))
  cursor.execute('SELECT roomId, secondsSinceLastEmpty, numberOfPeople FROM PopulationPrediction WHERE date = \'%s\'' %(maxDate))
  population = {}
  for pop in cursorOutput(cursor.fetchall()):
    # print(pop)
    pop = [x for x in pop]
    population[pop[0]] = {"secondsSinceLastEmpty": pop[1], "numberOfPeople": pop[2]}
  return make_response(jsonify(population))

@app.route('/predict/addState', methods=['POST'])
def setPopulation():
  content = request.json
  # print(content)
  db = getDB()
  cursor = db.cursor()
  first = True
  sqlQuery = 'INSERT INTO PopulationTimeseries (date,roomId,secondsSinceLastEmpty,numberOfPeople) VALUES '
  for roomId,value in content['values'].items():
    if not first:
      sqlQuery += ', '
    # hope no duplicates
    sqlQuery += '(\'%s\',%s,%s,%s)' %(content['datetime'],roomId,value["delta"],value["people"])
    first = False
  # print(sqlQuery)
  cursor.execute(sqlQuery)
  db.commit()
  # cursor.execute('SELECT * FROM PopulationTimeseries WHERE date = \'%s\'' %(content['datetime']))
  # print(cursorOutput(cursor.fetchall()))
  return "success"

if __name__ == '__main__':
  app.run(debug=True)