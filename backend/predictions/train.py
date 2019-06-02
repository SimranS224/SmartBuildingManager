from keras.models import Sequential
from keras.layers import Dense, LSTM
from keras.optimizers import RMSprop
from sklearn.preprocessing import MinMaxScaler
from sklearn.externals import joblib
import pandas as pd
import numpy as np

scaler_filename = "minMaxScaler"

def transformInput(dataFrame):
  columns, values = [], []
  for index, row in dataFrame.iterrows():
    columns += ["timeDiff_"+str(row["roomId"]),"numberOfPeople_"+str(row["roomId"])]
    values += [row["timeDiff"],row["numberOfPeople"]]
  return pd.DataFrame([values],columns=columns)

data = pd.read_csv('initial.csv',names=["date", "roomId", "timeDiff", "numberOfPeople"])
training_set = data.groupby("date").apply(transformInput)

# feature scale
scaler = MinMaxScaler(feature_range = (0, 1))
training_set_scaled = scaler.fit_transform(training_set)
joblib.dump(scaler, scaler_filename)

# data create
x_train = []
y_train = []
for i in range(100, training_set_scaled.shape[0]):
  x_train.append(training_set_scaled[i-100:i])
  # only take every other since every other would be people
  y_train.append(training_set_scaled[i])

x_train, y_train = np.array(x_train), np.array(y_train)

# many to many lstm
regressor = Sequential()
regressor.add(LSTM(units=50,return_sequences=True,input_shape=(x_train.shape[1],x_train.shape[2])))
regressor.add(LSTM(units=50,return_sequences=True))
regressor.add(LSTM(units=50))
regressor.add(Dense(units=y_train.shape[1]))
regressor.compile(optimizer=RMSprop(lr=0.0001),loss='mean_squared_error')
regressor.fit(x_train,y_train,epochs=100,batch_size=32)

predictions = regressor.predict(x_train[1200:1320])

# predictionsWithGarbage = np.zeros((predictions.shape[0],2*predictions.shape[1]))
# predictionsWithGarbage[:,::2] = predictions
predictions = np.rint(scaler.inverse_transform(predictions))

regressor.save('regressor.h5')