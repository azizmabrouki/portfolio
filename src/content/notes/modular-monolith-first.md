---
title: Why I start with a modular monolith
summary: Microservices solve problems a new product doesn’t have yet. Module boundaries solve the ones it does.
date: 2026-09-27
tags:
  - architecture
  - modular monolith
---

When I started designing StudioLabCloud, the question came up in the first week: one application, or several services? The platform had clear areas (billing, the service catalogue, support, messaging) and each one looked like a natural candidate for a service. I chose one Laravel application with strict internal boundaries instead. Three releases later, I would make the same call.

## What microservices actually buy you

Microservices let teams deploy independently and let parts of a system scale separately. Those are real benefits, but they are organisational and operational ones. They pay off when several teams keep blocking each other’s releases, or when one part of the system needs ten times the resources of the rest.

A new product built by one person or a small team has neither problem. What it has is a deadline and a domain it doesn’t fully understand yet. Splitting it into services on day one means paying the costs up front: network calls where there were function calls, failures that are partial instead of total, data spread across several stores, one pipeline per service, and tracing to find out which of them broke. All of that before the first client has paid for anything.

## What a new product does need: boundaries

The part of microservices that matters early isn’t the network. It is the boundary. Billing shouldn’t know how support stores a ticket, and support shouldn’t be able to change an invoice. Without boundaries, a codebase becomes one tangle where every change touches everything.

You can have the boundary without the network. In StudioLabCloud, modules talk to each other through explicit contracts: a small set of services and data transfer objects that other modules are allowed to use. Everything else is internal. The rule I try to hold is simple: a module that needs something from another one asks through the contract, never by reaching into its internals.

That gives three things right away.

- **Changes stay local.** Rewriting how support routes a ticket doesn’t ripple into billing, because billing only ever saw the contract.
- **The design is visible.** A contract is a list you can read. When someone joins the project, the contracts are the map.
- **The exit stays open.** If a module ever needs to become a service, its contract is already the API. The work is moving code and adding a network hop, not untangling the code first.

## What it costs

A monolith’s boundaries are only as strong as the team’s discipline. Nothing at runtime stops a developer from importing a class from another module when a deadline is close. The code compiles and the tests pass.

Two habits help. The first is writing down why each boundary exists, in an architecture decision record: the context, the options, and the trade-off accepted. A boundary with a written reason is harder to break casually than one that only felt right. The second is making the rule checkable where you can, with architecture tests or a line in the review checklist, so that crossing a boundary is a visible decision rather than an accident.

The other cost is that everything scales together. If one module needs far more resources than the rest, you scale the whole application. For most products, for a long time, that is still cheaper than running a distributed system.

## When I would split

I would extract a module into its own service when one of these becomes true, and not before:

1. A separate team owns it, and our releases keep blocking each other.
2. It needs to scale, or to fail, independently of the rest.
3. It needs a different runtime.

The third one already happened in StudioLabCloud, in a small way. The support assistant relies on retrieval and language models, and that tooling lives in Python, not PHP. So it runs as its own Python service behind a handover contract, while everything else stays in one application.

That is the point of starting with modules. When a real reason to split shows up, the boundary is already there, and you split exactly one piece.

## The short version

Start with one deployable and strict modules. Write down why each boundary is where it is. Split a module out when a team, a scaling need or a runtime forces it, and let its contract become its API.
