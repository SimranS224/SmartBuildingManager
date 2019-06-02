from keras.models import load_model
from sklearn.externals import joblib
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import MySQLdb

numberOf10Seconds = 720

INSTANCE_NAME = 'tsflo-242417:us-east1:predict-db'
DB_NAME = 'population_db'
DB_USER = 'firstUser'
DB_PASS = '0'

datetimeFormat = '%Y-%m-%d %H:%M:%S'
scaler_filename = "minMaxScaler"
# use what we predicted to predict the next ones

def cursorOutput(fetchall):
  return [[b for b in a] for a in fetchall]

def transformInput(dataFrame):
  columns, values = [], []
  for index, row in dataFrame.iterrows():
    columns += ["timeDiff_"+str(row["roomId"]),"numberOfPeople_"+str(row["roomId"])]
    values += [row["numberOfPeople"],row["timeDiff"]]
  return pd.DataFrame([values],columns=columns)

def inverseTransformInput(dataFrame):
  inputSeries = dataFrame.iloc[0]
  print(inputSeries)
  date=inputSeries[0]
  values = []
  for i in range(1, inputSeries.size, 2):
    values.append([date,i/2,inputSeries[i],inputSeries[i+1]])
  return pd.DataFrame(values,columns=['date','roomId','secondsSinceLastEmpty','numberOfPeople'])

model = load_model('regressor.h5')

# want to model.input_shape[1] dates
# Get number of entries to get
offset = model.input_shape[2] / 2
offset *= model.input_shape[1]

#db = sqlalchemy.create_engine("mysql+pymysql://%s:%s@35.243.145.54/%s" %(DB_USER,DB_PASS,DB_NAME))
#connection = db.connect()
db = MySQLdb.connect(host="35.243.145.54", db=DB_NAME, user=DB_USER, passwd=DB_PASS, charset='utf8')
connection = db.cursor()

x_val= pd.read_sql('SELECT date,roomId,secondsSinceLastEmpty,numberOfPeople FROM PopulationTimeseries ORDER BY date DESC LIMIT %i' %(offset), db)
x_val.columns=["date", "roomId", "timeDiff", "numberOfPeople"]
x_val.sort_values(["date", "roomId"],inplace=True)
# print(x_val)
x_val = x_val.groupby("date").apply(transformInput).reset_index(level=0)
print(x_val)
scaler = joblib.load(scaler_filename)
x_val[x_val.iloc[:,1:].columns] = scaler.transform(x_val.iloc[:,1:])
#print(x_val)
# I is number of 10 seconds ahead we are predicting
tail_size = x_val.shape[0]
shapes = (1,x_val.shape[0],x_val.shape[1]-1)
for i in range(1, numberOf10Seconds):
  temp = np.reshape(np.array(x_val.iloc[:,1:].tail(tail_size)),shapes)
  predictions = model.predict(temp)
  mostRecent = x_val.tail(1)
  # print(mostRecent)
  for i in range(2,mostRecent.shape[1],2):
    if predictions[0,i-1] == 0 and mostRecent.iloc[0,i] == 0:
      # should add a normalized
      predictions[0,i-2]=mostRecent.iloc[0,i-1]
    elif predictions[0,i-1] != 0 and mostRecent.iloc[0,i] != 0:
      # should subtract a normalized
      predictions[0,i-2]=mostRecent.iloc[0,i-1]
    else:
      predictions[0,i-2]=0
  nextTime = mostRecent.iloc[0]['date'] + timedelta(seconds=10)
  # print([nextTime]+predictions[0].tolist())
  x_val=x_val.append(pd.DataFrame([[nextTime]+predictions[0].tolist()], columns=x_val.columns),ignore_index=True)

date = x_val['date'].min()
print(date)
print('DELETE FROM PopulationPrediction WHERE date >= \'%s\'' %(date))
connection.execute('DELETE FROM PopulationPrediction WHERE date >= \'%s\'' %(date))
print(x_val)
x_val[x_val.columns[1:]] = scaler.inverse_transform(x_val.iloc[:,1:])
print("hi")
x_val = x_val.groupby('date',as_index=False).apply(inverseTransformInput)
print(x_val)
db.commit()
x_val.to_sql('PopulationPrediction',db,if_exists='append')
db.commit()
