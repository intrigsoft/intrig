---
title: Intrig CLI Usage
---

## Introduction

The Intrig CLI is a powerful command-line tool designed to manage API integrations efficiently. It allows developers to add, list, remove, and synchronize API sources while providing baseline creation and code generation functionalities. With built-in support for development and build phases, Intrig CLI ensures seamless integration into your development workflow.

## Usage

```bash
intrig [COMMAND]
```

## Commands

### init

**Description:**
Initializes a new Intrig configuration file.

```bash
intrig init
```

### add

**Description:**
Adds a new API source to the Intrig configuration.

```bash
intrig add [-s <value>] [-i <value>]
```

**Flags:**

- `-i, --id=<value>`: Unique ID for the API.
- `-s, --source=<value>`: OpenAPI specification URL.

### ls

**Description:**
Lists API sources from the Intrig configuration.

```bash
intrig ls [-d] [-f <value>]
```

**Flags:**

- `-d, --detailed`: Show detailed information for each source.
- `-f, --filter=<value>`: Filter sources by name or ID.

### baseline

**Description:**
Creates a baseline version for API specifications.

```bash
intrig baseline -i <value> -v <value> [-f]
```

**Flags:**

- `-i, --id=<value>` (required): ID of the API to baseline.
- `-v, --version=<value>` (required): Semantic or custom version for the baseline.
- `-f, --force`: Force baseline even if the version already exists.

### sync

**Description:**
Synchronizes API specifications.

```bash
intrig sync [-a | -i <value>...]
```

**Flags:**

- `-a, --all`: Sync all APIs.
- `-i, --ids=<value>...`: Comma-separated list of API IDs to sync.

### generate

**Description:**
Regenerates code.

```bash
intrig generate [-a | -i <value>...]
```

**Flags:**

- `-a, --all`: Sync all APIs.
- `-i, --ids=<value>...`: Comma-separated list of API IDs to sync.

**Examples:**

```bash
intrig generate 
```

### rm

**Description:**
Removes an API source from the Intrig configuration.

```bash
intrig rm [SOURCE]
```

**Arguments:**
- `SOURCE`: ID of the source to remove.

### insight

**Description:**
Starts the web view for Intrig insight.

```bash
intrig insight [-p <value>] [-d]
```

**Flags:**

- `-p, --port=<value>` [default: 7007]: Port to run the Next.js server on.
- `-d, --debug`: Enable debug mode to show server-side logs.

**Examples:**
```bash
intrig insight
```

