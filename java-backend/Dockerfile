
FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN for attempt in 1 2 3 4 5; do \
    mvn -B -Dmaven.wagon.http.retryHandler.count=5 -DskipTests package && exit 0; \
    echo "Maven download failed. Retrying in 30 seconds..."; \
    sleep 30; \
    done; \
    exit 1

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-10000} --server.address=0.0.0.0"]
