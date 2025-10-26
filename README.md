# SharpScript

[![NPM Version](https://img.shields.io/npm/v/sharpscript)](https://www.npmjs.com/package/sharpscript)
[![License](https://img.shields.io/npm/l/sharpscript)](https://opensource.org/licenses/MIT)

> **Effortlessly bridge your C# backend with TypeScript frontends**

SharpScript is a powerful CLI tool and library that automatically generates TypeScript classes and enums from your C# DTOs. Say goodbye to manual type synchronization and hello to type-safe full-stack development.

---

## Why SharpScript?

In modern full-stack applications, keeping frontend TypeScript types aligned with backend C# models is tedious and error-prone. SharpScript eliminates this friction by:

- **Automating type generation** – Transform C# DTOs into TypeScript with one command
- **Maintaining type safety** – Keep your frontend and backend perfectly synchronized
- **Saving development time** – No more manual type definitions or copy-paste errors
- **Scaling with your project** – Handles complex nested folder structures effortlessly

---

## Features

### TypeScript Class Generation

- **Smart property mapping** – Automatically converts C# properties to TypeScript
- **Intelligent defaults** – Primitives get appropriate default values (`0`, `''`, `false`)
- **Nullable handling** – C# nullable types become TypeScript optional properties with `undefined`
- **Modern constructors** – Includes `Partial<T>` initialization for flexible object creation

### TypeScript Enum Generation

- **Consolidated output** – Combines multiple C# enums into a single `enum.ts` file
- **Flexible organization** – Optional separate enums folder
- **Preserves semantics** – Maintains enum values and structure

### Intelligent File Organization

- **Folder-aware generation** – Groups related DTOs from each folder into cohesive TypeScript files
- **Automatic naming** – Cleans folder names (removes `DTO`, `DTOs`, `dto`, `dtos` suffixes)
- **Recursive scanning** – Discovers and processes deeply nested DTO structures
- **Clean output structure** – Mirrors your C# project organization

---

## Installation

### Global Installation

```bash
npm install -g sharpscript
```

### Project Installation

```bash
npm install --save-dev sharpscript
```

---

## Quick Start

### CLI Usage

```bash
sharpscript <sourceClassesPath> <destPath> [enumsSourcePath]
```

**Parameters:**

- `sourceClassesPath` – Path to your C# DTO folder
- `destPath` – Output directory for TypeScript files
- `enumsSourcePath` – (Optional) Path to your C# enums folder

**Real-world Example:**

```bash
sharpscript ../MyApp.Server/Data/DTOs ./src/@types ../MyApp.Server/Data/Enums
```

This command will:

- Scan all C# DTOs in `../MyApp.Server/Data/DTOs`
- Generate TypeScript classes in `./src/@types`
- Combine all enums into `./src/@types/enums/enum.ts`

---

### Package.json Setup (Recommended)

For easier workflow integration, add scripts to your `package.json`:

```json
{
  "scripts": {
    "generate:types": "sharpscript ../MyApp.Server/Data/DTOs ./src/@types ../MyApp.Server/Data/Enums"
  }
}
```

**Benefits:**

- ✅ One simple command: `npm run generate:types`

## Programmatic API

For advanced workflows, use SharpScript as a library:

```typescript
import fs from "fs";
import { parseCSharpDTO } from "sharpscript/parser/csharpParser";
import {
  generateTsClass,
  generateTsEnum,
} from "sharpscript/generator/tsGenerator";

// Read your C# DTO file
const csharpCode = fs.readFileSync("./DTOs/UserDTO.cs", "utf-8");

// Parse C# code
const { classes, enums } = parseCSharpDTO(csharpCode);

// Generate TypeScript classes
classes.forEach((cls) => {
  const tsCode = generateTsClass(cls);
  fs.writeFileSync(`./types/${cls.name}.ts`, tsCode);
});

// Generate TypeScript enums
enums.forEach((enumDef) => {
  const tsEnum = generateTsEnum(enumDef);
  fs.appendFileSync("./types/enum.ts", tsEnum + "\n\n");
});
```

---

## Examples

### Input: C# DTO

```csharp
public class UserDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public DateTime? CreatedDate { get; set; }
    public bool IsActive { get; set; }
}
```

### Output: TypeScript Class

```typescript
export class UserDTO {
  Id: number = 0;
  Name: string = "";
  Email: string = "";
  CreatedDate?: Date | undefined = undefined;
  IsActive: boolean = false;

  constructor(init?: Partial<UserDTO>) {
    Object.assign(this, init);
  }
}
```

**Usage in your TypeScript code:**

```typescript
// Create with all properties
const user = new UserDTO({
  Id: 1,
  Name: "Juan Dela Cruz",
  Email: "juandelacruz@example.com",
  IsActive: true,
});

// Create with partial properties
const draft = new UserDTO({
  Name: "John Doe",
  Email: "johndoe@example.com",
  IsActive: false,
});
```

---

### Input: C# Enum

```csharp
public enum UserRole
{
    ADMIN,
    CLIENT,
    EMPLOYEE
}

public enum OrderStatus
{
    PENDING,
    PROCESSING,
    COMPLETED,
    CANCELLED
}
```

### Output: TypeScript Enums

```typescript
export enum UserRole {
  ADMIN,
  CLIENT,
  EMPLOYEE,
}

export enum OrderStatus {
  PENDING,
  PROCESSING,
  COMPLETED,
  CANCELLED,
}
```

---

## Project Structure

### Before (C# Backend)

```
MyApp.Server/
├── Data/
│   ├── DTOs/
│   │   ├── User/
│   │   │   ├── UserDTO.cs
│   │   │   └── UserProfileDTO.cs
│   │   └── Order/
│   │       └── OrderDTO.cs
│   └── Enums/
│       ├── UserRole.cs
│       └── OrderStatus.cs
```

### After (TypeScript Frontend)

```
src/
├── @types/
│   ├── user.type.ts
│   ├── order.type.ts
│   └── enums/
│       └── enum.ts
```

---

## Configuration & Behavior

### Automatic Folder Name Cleaning

SharpScript intelligently cleans folder names for TypeScript output:

| C# Folder Name | TypeScript Output  |
| -------------- | ------------------ |
| `UserDTO`      | `user.type.ts`     |
| `UserDTOs`     | `user.type.ts`     |
| `Userdto`      | `user.type.ts`     |
| `Products`     | `products.type.ts` |

### Type Mapping

| C# Type                          | TypeScript Type  | Default Value |
| -------------------------------- | ---------------- | ------------- |
| `int`, `long`, `double`, `float` | `number`         | `0`           |
| `string`                         | `string`         | `''`          |
| `bool`                           | `boolean`        | `false`       |
| `DateTime`                       | `Date`           | `undefined`   |
| `T?` (nullable)                  | `T \| undefined` | `undefined`   |
| `List<T>`, `T[]`                 | `T[]`            | `[]`          |

### Nullable Properties

C# nullable properties are converted to TypeScript optional properties:

```csharp
public DateTime? LastLogin { get; set; }
```

Becomes:

```typescript
lastLogin?: Date | undefined = undefined;
```

---

## License

MIT © [Your Name/Organization]

---

## Links

- [NPM Package](https://www.npmjs.com/package/sharpscript)
- [GitHub Repository](https://github.com/mjcornelio/sharpscript)
- [Report Issues](https://github.com/mjcornelio/sharpscript/issues)

---

## Support

Need help? Have questions?

- Open an issue on GitHub
- Start a discussion
- Star the repo if SharpScript saves you time!

---

**Built with ❤️ for full-stack developers who value type safety**
