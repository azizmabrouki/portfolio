---
title: StudioLabCloud
summary: A SaaS platform for selling and managing cloud services, built as a modular monolith with recurring billing, a support desk and an AI assistant that knows when to hand over.
teaser: A SaaS platform for selling and managing cloud services, built as a modular monolith with recurring billing and a support desk.
brief:
  problem: Sell cloud services, bill them every month in several currencies and support the clients, in one product that a small team can keep running.
  result: A modular monolith shipped in 3 releases, with billing that ==never charges twice==, a support desk whose assistant hands over to a person, and 609 automated tests.
sheet: '01'
period: Feb – Aug 2026
# Placeholder wording: the exact internship title is still to be confirmed.
role: Intern, final-year project
company: StudioLab
facts:
  - label: My part
    value: 'The whole chain: architecture, interface design, implementation, tests and deployment'
  - label: Team
    value: Solo, with the product owner
  - label: Shape
    value: Final-year project, 6 Scrum sprints, 3 releases
  - label: Now
    value: Kept running as a freelancer
screens:
  - placeholder: '[Screenshot: client portal, ordering a service]'
    caption: 'The client portal: order a service, pay for it, get help.'
  - placeholder: '[Screenshot: support desk, assistant handing over]'
    caption: The support desk, where the assistant passes a conversation to an agent.
stack:
  - Laravel 12
  - PHP
  - Stripe
  - Python
  - Flask
  - Hugging Face Transformers
  - Pest
  - OpenAPI
  - Docker
  - Kubernetes
  - Grafana
  - CI/CD
numbers:
  - value: '609'
    label: automated tests
  - value: '25'
    label: OpenAPI specs
  - value: '3'
    label: releases in 6 sprints
decisions:
  - title: One deployable, hard module boundaries
    chose: A [[modular monolith]] in Laravel, whose modules talk ==only through explicit contracts== and DTOs.
    over: Microservices from the first release.
    why: One team, one database and a first release to ship. Contracts give most of the separation microservices promise, without the network hops, the extra deployments and the distributed failures.
    tradeoff: Nothing but discipline stops a module from reaching into another one. [[Architecture decision records|adr]] write down why each boundary exists, so it survives the next deadline.
    node: contracts
  - title: Webhooks that may arrive twice
    chose: '[[Idempotent]] webhook processing, so each payment event is recorded and ==applied once==.'
    over: Trusting every webhook to arrive exactly once.
    why: Payment providers retry deliveries, and a replayed event must ==never charge a client twice==.
    tradeoff: One more piece of state to store and check on every event, and tests written for the replay cases.
    node: billing
  - title: An assistant that knows when to stop
    chose: A separate Python [[RAG]] assistant behind a ==handover contract== that escalates to a human agent.
    over: An assistant inside the PHP application, or one that tries to answer everything.
    why: Python has the retrieval and model tooling. The contract says when the bot passes the conversation to a person, so ==a wrong answer is never the last word==.
    tradeoff: A second runtime to deploy and monitor, and a contract to keep in step on both sides.
    node: assistant
diagram:
  title: The system, simplified.
  description: Clients and support agents use one Laravel application split into modules. Billing talks to Stripe and receives its webhooks; the support desk hands conversations to and from a separate Python assistant. Everything runs on Kubernetes, watched by Grafana.
  alt: 'Architecture diagram. Clients and the back office reach a Laravel modular monolith on Kubernetes over HTTPS. Inside it: accounts, catalogue, provisioning, billing, support desk, messaging and the module contracts. Billing sends charges to Stripe and receives its webhooks, applied once. The support desk sends questions to a Python RAG assistant, which hands conversations back. The application uses one database and sends metrics to Grafana.'
  columns: 6
  rows: 4
  groups:
    - id: app
      label: Laravel modular monolith · Kubernetes
      x: 0
      y: 1
      w: 4
      h: 2
  nodes:
    - id: clients
      label: Client portal
      note: order · pay · get help
      kind: client
      x: 0
      y: 0
      w: 2
    - id: agents
      label: Back office
      note: support and admin
      kind: client
      x: 2
      y: 0
      w: 2
    - id: accounts
      label: Accounts
      x: 0
      y: 1
    - id: catalogue
      label: Catalogue
      note: cloud services
      x: 1
      y: 1
    - id: provisioning
      label: Provisioning
      x: 2
      y: 1
    - id: billing
      label: Billing
      note: multi-currency · tax
      accent: true
      x: 3
      y: 1
    - id: support
      label: Support desk
      note: tickets · handover
      accent: true
      x: 0
      y: 2
    - id: messaging
      label: Messaging
      note: chat · video calls
      x: 1
      y: 2
    - id: contracts
      label: Module contracts
      note: DTOs · decision records
      kind: service
      x: 2
      y: 2
      w: 2
    - id: stripe
      label: Stripe
      note: payments
      kind: external
      x: 5
      y: 1
    - id: assistant
      label: RAG assistant
      note: Python · Flask
      kind: service
      x: 0
      y: 3
    - id: database
      label: Database
      kind: store
      x: 2
      y: 3
    - id: grafana
      label: Grafana
      note: monitoring
      kind: external
      x: 5
      y: 2
  edges:
    - from: clients
      to: app
      label: HTTPS
    - from: agents
      to: app
      label: HTTPS
    - from: billing
      to: stripe
      label: charges
    - from: stripe
      to: billing
      label: webhooks, applied once
      dashed: true
    - from: support
      to: assistant
      label: questions
    - from: assistant
      to: support
      label: handover
      dashed: true
    - from: app
      to: database
    - from: app
      to: grafana
      label: metrics
      dashed: true
  narrow:
    columns: 2
    rows: 9.1
    alt: 'Architecture diagram, drawn top to bottom. The client portal and the back office reach a Laravel modular monolith on Kubernetes over HTTPS. Inside it: accounts, catalogue, the module contracts, provisioning, messaging, the support desk and billing. Below it, the support desk sends questions to a Python RAG assistant, which hands conversations back; billing sends charges to Stripe and receives its webhooks, applied once. The application uses one database and sends metrics to Grafana.'
    groups:
      app: { x: 0, y: 1.3, w: 2, h: 4.45 }
    nodes:
      clients: { x: 0, y: 0 }
      agents: { x: 1, y: 0 }
      accounts: { x: 0, y: 1.75 }
      catalogue: { x: 1, y: 1.75 }
      contracts: { x: 0, y: 2.75, w: 2 }
      provisioning: { x: 0, y: 3.75 }
      messaging: { x: 1, y: 3.75 }
      support: { x: 0, y: 4.75 }
      billing: { x: 1, y: 4.75 }
      assistant: { x: 0, y: 6.7 }
      stripe: { x: 1, y: 6.7 }
      database: { x: 0, y: 8.2 }
      grafana: { x: 1, y: 8.2 }
    lanes:
      database: left
      grafana: right
---

## Context

StudioLab sells cloud services to French-speaking clients: compute, hosting, storage and business email. StudioLabCloud is the platform where those clients order the services, pay for them every month and get help when something goes wrong.

I designed and built it as my final-year engineering project, from February to August 2026, and owned the whole chain: system architecture, interface design, implementation, tests and deployment. It shipped in three releases over six Scrum sprints.

## The problem

Three concerns had to live in one product <mark>without tangling</mark>. **Money:** recurring payments in several currencies, with taxes, where a bug costs a client real money. **Services:** what each client has ordered and what is running for them. **People:** tickets, messages and video calls with the support team, where a stalled conversation loses a client.

And <mark>a small team had to be able to run it</mark> and change it after I leave. That ruled out anything clever for its own sake.

## What I built

A Laravel application split into modules with explicit contracts, so <mark>billing never reaches into support</mark> and support never reaches into billing. Recurring Stripe billing in several currencies, with webhook processing that is safe to replay. A support desk with ticketing, client messaging and video calls. In the last sprint, a Python retrieval-augmented assistant for first-level support, which <mark>hands the conversation to a human agent</mark> when it can’t answer.

Around it: **609 automated tests**, **25** OpenAPI specs, architecture decision records, CI/CD pipelines, a Kubernetes deployment and Grafana monitoring.
