# A-B-S-P-O Semantic Search Interface

## Overview

This interface implements the A-B-S-P-O framework for building semantic search statements, designed to work with knowledge graphs and RDF triples.

## What is A-B-S-P-O?

A-B-S-P-O is a 5-variable vector framework for representing semantic search statements:

- **A (Question Type)**: {who, what, where, when, why, how}
- **B (Verb)**: Main verb forms {be, have, be able to, increase, reduce, etc.}
- **S (Subject)**: The main entity, noun, or energetic unit being queried
- **P (Predicate)**: The relationship, property, or causation connecting S and O
- **O (Object)**: The target entity, noun, or energetic unit that relates to S

The S-P-O components form an **RDF triple** (node-arc-node) commonly used in knowledge graphs.

## Features

### 1. Initial Query Input
- Start with a natural language question or search intent
- The system analyzes your input and suggests appropriate A-B-S-P-O components
- Provides coaching to help users refine their semantic statements

### 2. Interactive Dropdown Wheels (Select Components)
Each component has a dedicated selection interface:

- **A Selector**: Choose question type (who, what, where, when, why, how)
- **B Selector**: Select verb form from common options
- **S Input**: Enter subject entity (with text input for flexibility)
- **P Selector**: Choose predicate/relationship from common options or enter custom
- **O Input**: Enter object entity (with text input for flexibility)

### 3. Real-time Statement Building
- As you select/enter components, the semantic statement updates in real-time
- Visual color-coding helps identify each component
- Clear display of the complete A-B-S-P-O statement

### 4. RDF Triple Display
- When S, P, and O are filled, displays the structured RDF triple
- Shows the node-arc-node configuration
- Helps users understand knowledge graph structure

## Usage

### Opening the Interface

Simply open `semantic-search.html` in any modern web browser:

```bash
# Using Python's built-in server
python3 -m http.server 8000

# Then navigate to:
http://localhost:8000/semantic-search.html
```

Or just double-click the file to open it directly in your default browser.

### Example Workflow

1. **Enter your initial question:**
   ```
   What proteins are involved in DNA repair?
   ```

2. **Click "Analyze & Build Query"** to get suggestions

3. **Review and adjust the components:**
   - A: "what"
   - B: "are"
   - S: "proteins"
   - P: "participates in"
   - O: "DNA repair"

4. **View the semantic statement:**
   ```
   WHAT are proteins participates in DNA repair?
   ```

5. **View the RDF triple:**
   ```
   Subject: proteins
   Predicate: participates in
   Object: DNA repair
   ```

## Use Cases

### Biological/Medical Research
```
Question: How does aspirin reduce inflammation?
- A: how
- B: reduces
- S: aspirin
- P: reduces
- O: inflammation
```

### Knowledge Graph Queries
```
Question: What genes regulate cell growth?
- A: what
- B: regulate
- S: genes
- P: regulates
- O: cell growth
```

### Scientific Literature Search
```
Question: Which pathways are affected by oxidative stress?
- A: which
- B: are
- S: pathways
- P: affected by
- O: oxidative stress
```

## Technical Details

### Technology Stack
- Pure HTML/CSS/JavaScript (no dependencies)
- Responsive design for mobile and desktop
- Modern browser compatible (Chrome, Firefox, Safari, Edge)

### Component Structure

```
A-B-S-P-O Framework
├── A: Question Type (dropdown)
├── B: Verb Form (dropdown)
├── S: Subject Entity (text input)
├── P: Predicate/Relationship (dropdown + custom input)
└── O: Object Entity (text input)
```

### Integration Possibilities

The interface can be integrated with:
- SPARQL endpoints (for querying RDF databases)
- GraphQL APIs
- Bio2RDF.org and similar semantic databases
- Knowledge graph systems
- Search engines using semantic parsing

## Customization

### Adding More Verbs (B Component)
Edit the `componentB` select element to add more verb options.

### Adding More Predicates (P Component)
Edit the `componentP` select element to add domain-specific relationships.

### Styling
All CSS is embedded in the HTML file. Modify the `<style>` section to customize appearance.

### Query Parsing
The `parseInitialQuery()` function can be enhanced with more sophisticated NLP or regular expressions to better detect entities and relationships.

## Future Enhancements

Potential improvements:
1. Backend integration for actual search execution
2. Integration with triple-store databases
3. SPARQL query generation from A-B-S-P-O
4. Entity recognition using NLP
5. Auto-suggestion for S and O based on ontologies
6. Query history and saved searches
7. Export to various query formats

## License

Part of the kwikBio project. See main README.md for licensing information.

## Support

For questions or suggestions about the semantic search interface, please file an issue on the GitHub repository.
