---
title: HMA4Tech plant-anomaly platform
summary: The back end of an AI platform that detects anomalies in plants, as a ==secured Spring Boot API==, containerized and tuned.
brief:
  problem: An AI platform needed a back end the rest of the product could rely on, and deployments kept breaking from one machine to the next.
  result: A Spring Boot API secured with [[JWT]] and [[RBAC]], containers everywhere (**~40% fewer** environment issues) and **20–30% faster** average responses.
sheet: '02'
period: Dec 2024 – Dec 2025
role: Full-stack engineer, internship
company: HMA4Tech
stack:
  - Java
  - Spring Boot
  - Spring Security
  - JWT
  - PostgreSQL
  - Docker
numbers:
  - value: 10+
    label: REST endpoints
  - value: ~40%
    label: fewer environment-related deployment issues
  - value: 20–30%
    label: faster average API responses
decisions:
  - title: Stateless authentication
    chose: '[[JWT]] authentication with [[role-based access control|rbac]].'
    over: Server-side sessions.
    why: Any instance of the API can ==check a request on its own==, which keeps it simple to run in containers and to scale out. Roles map directly to who may read or change what.
    tradeoff: A token stays valid until it expires, so expiry times and roles have to be designed with care.
    node: jwt
  - title: The same container everywhere
    chose: Docker images for every back-end service.
    over: Setting up each machine by hand.
    why: The environment ships with the code, so ==what runs on one machine runs on the next==. Environment-related deployment issues dropped by **about 40%**.
    tradeoff: Image builds become part of the workflow, and one more tool for the team to learn.
    node: api
  - title: Fix the query before adding hardware
    chose: Tuning the PostgreSQL queries behind the slow endpoints.
    over: A caching layer or a bigger server.
    why: Average API response time went down **20–30%** with ==no new component== to run or keep in sync.
    tradeoff: Gains come one query at a time, and they need watching as the data grows.
    node: postgres
diagram:
  title: The HMA4Tech back end, simplified
  description: Platform clients call a Spring Boot API that runs in Docker. Requests pass a JWT filter, then REST controllers, services with role checks and repositories backed by PostgreSQL. Services read the anomalies found by the AI team’s models.
  columns: 4
  rows: 3
  groups:
    - id: api
      label: Spring Boot API · Docker
      x: 0
      y: 1
      w: 4
      h: 1
  nodes:
    - id: clients
      label: Platform clients
      note: users by role
      kind: client
      x: 0
      y: 0
    - id: jwt
      label: JWT filter
      note: authentication
      accent: true
      x: 0
      y: 1
    - id: controllers
      label: REST controllers
      note: 10+ endpoints
      x: 1
      y: 1
    - id: services
      label: Services
      note: role checks
      accent: true
      x: 2
      y: 1
    - id: repositories
      label: Repositories
      x: 3
      y: 1
    - id: models
      label: AI models
      note: anomaly detection
      kind: external
      x: 2
      y: 2
    - id: postgres
      label: PostgreSQL
      note: tuned queries
      kind: store
      x: 3
      y: 2
  edges:
    - from: clients
      to: api
      label: HTTPS + JWT
    - from: jwt
      to: controllers
    - from: controllers
      to: services
    - from: services
      to: repositories
    - from: models
      to: services
      label: anomalies
      dashed: true
    - from: repositories
      to: postgres
---

## Context

HMA4Tech is a startup building an AI platform that detects anomalies in plants. From December 2024 to December 2025 I worked in its agile team of AI engineers and developers, as a full-stack engineer on the platform’s back end.

## The problem

The AI work needed <mark>a back end the rest of the product could rely on</mark>: an API to reach it, access rules that depend on who is asking, and deployments that behave the same on every machine. Environment differences kept causing deployment issues, and some API responses were slower than they needed to be.

## What I built

**More than ten** REST endpoints in Spring Boot, secured with <button type="button" class="term" popovertarget="term-jwt">JWT</button> authentication and <button type="button" class="term" popovertarget="term-rbac">role-based access control</button>. Docker images for the back-end services, so development and deployment run the same thing. And a round of PostgreSQL query tuning that brought the average API response time <mark>down by **20 to 30 percent**</mark>.
