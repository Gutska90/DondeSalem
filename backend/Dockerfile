# Build: docker build -t dondesalem-api .
# Run:  docker run --rm -p 8080:8080 -e DATABASE_URL=... -e JWT_SECRET=... dondesalem-api
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /build/target/api-0.1.0-SNAPSHOT.jar app.jar
# Perfil prod por defecto; Railway puede sobreescribir con SPRING_PROFILES_ACTIVE
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
# Railway inyecta PORT; no fijar PORT=8080 en variables del panel
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
