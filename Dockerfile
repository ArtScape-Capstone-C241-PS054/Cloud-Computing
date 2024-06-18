# FROM python:3.10-slim

# ENV PYTHONUNBUFFERED True

# ENV APP_HOME /APP_HOME
# WORKDIR $APP_HOME
# COPY . ./

# RUN pip install -r requirements.txt

# CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 genreClassification:app
# Use the official TensorFlow image as a parent image
# Use the official TensorFlow image as a parent image
FROM tensorflow/tensorflow:2.9.1

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Upgrade pip to the latest version
RUN python -m pip install --upgrade pip

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run app.py when the container launches
# CMD ["python", "app.py"]
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 genreClassification:app