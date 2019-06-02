CREATE TABLE PopulationTimeseries
(
    date DATETIME,
    roomId int,
    secondsSinceLastEmpty int,
    numberOfPeople int,
    PRIMARY KEY(date, roomId)
);

CREATE TABLE PopulationPrediction
(
    date DATETIME,
    roomId int,
    secondsSinceLastEmpty int,
    numberOfPeople int,
    PRIMARY KEY(date, roomId)
);