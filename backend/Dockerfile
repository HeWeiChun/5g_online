FROM ubuntu:20.04
LABEL authors="whe"
VOLUME [ "/data" ]

VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]