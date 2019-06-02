from keras.models import load_model
from sklearn.externals import joblib
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import MySQLdb
import sqlalchemy

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

def inverseTransformInput(inputSeries):
  date=inputSeries[0]
  values = []
  for i in range(1, inputSeries.size):
    values.append([date,i/2,inputSeries[i],inputSeries[i+1]])
  return pd.DataFrame(values,columns=['date','roomId','secondsSinceLastEmpty','numberOfPeople'])

model = load_model('regressor.h5')

# want to model.input_shape[1] dates
# Get number of entries to get
offset = model.input_shape[2] / 2
offset *= model.input_shape[1]

db = sqlalchemy.create_engine("mysql+pymysql://%s:%s@35.243.145.54/%s" %(DB_USER,DB_PASS,DB_NAME))


#db = MySQLdb.connect(unix_socket='/cloudsql/' + INSTANCE_NAME, db=DB_NAME, user=DB_USER, passwd=DB_PASS, charset='utf8')
x_val= pd.read_sql('SELECT date,roomId,secondsSinceLastEmpty,numberOfPeople FROM PopulationTimeseries ORDER BY date DESC LIMIT %i' %(offset), db)
x_val.columns=["date", "roomId", "timeDiff", "numberOfPeople"]
x_val.sort_values(["date", "roomId"])
print(x_val)
x_val = x_val.groupby("date").apply(transformInput)

scaler = joblib.load(scaler_filename)
x_val[x_val.columns] = scaler.transform(x_val)

# I is number of 10 seconds ahead we are predicting
for i in range(1, numberOf10Seconds):
  temp = np.reshape(np.array(x_val.tail(x_val.shape[0])),(1,x_val.shape[0],x_val.shape[1]))
  predictions = model.predict(temp)
  mostRecent = x_val.tail(1)
  print(mostRecent)
  for i in range(1,mostRecent.shape[1],2):
    if predictions[0,i] == 0 and mostRecent.iloc[0,i] == 0:
      predictions[0,i-1]=mostRecent.iloc[0,i-1]
    elif predictions[0,i] != 0 and mostRecent.iloc[0,i] != 0:
      predictions[0,i-1]=mostRecent.iloc[0,i-1]
    else:
      predictions[0,i-1]=0
  nextTime = datetime.strptime(mostRecent[0]['date'], datetimeFormat) + timedelta(seconds=10)
  print([nextTime.strftime(datetimeFormat)]+predictions[0].tolist())
  x_val.append([nextTime.strftime(datetimeFormat)]+predictions[0].tolist(),ignore_index=True)

date = x_val['date'].min
print(date)
cursor.execute('DELETE FROM PopulationPrediction WHERE date >= \'%s\'' %(date))

x_val[x_val.columns[1:]] = scaler.inverse_transform(x_val.iloc[:,1:])
x_val = x_val.apply(inverseTransformInput,axis=1)
print(x_val)

db.commit()
x_val.to_sql('PopulationPrediction',db,if_exists='append')
db.commit()