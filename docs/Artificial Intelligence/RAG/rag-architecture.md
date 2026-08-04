---
title: RAG Architecture
sidebar_label: RAG Architecture
sidebar_position: 1
---

**RAG architecture** is a two‑stage design that sits in front of a large language model (LLM): first it **retrieves** relevant documents from an external knowledge base, then it **generates** an answer using those documents as grounded context.[1][2][3]

## High‑level view (two phases)

Most RAG systems are split into:

1. **Offline ingestion pipeline** (run when data changes)
2. **Real‑time query pipeline** (run for each user question)[3]

### 1) Ingestion pipeline (offline)

This prepares your data so it can be retrieved quickly and semantically:

1. **Collect & preprocess documents**
   - Pull from sources like PDFs, wikis, databases, APIs.
   - Optional: clean text, remove PII, add metadata (source, date, tenant).[4]

2. **Chunking**
   - Split documents into segments (e.g., 256–1024 tokens) with some overlap.[3]
   - Good chunking is critical: it defines the “units of knowledge” the system can retrieve.

3. **Embedding**
   - Run each chunk through an embedding model to get a dense vector.[5][3]
   - Same model must be used later for queries.

4. **Indexing into a vector store**
   - Store vectors + metadata in a vector database or search engine (e.g., Azure AI Search, Pinecone, Qdrant).[6][3][4]
   - Build an approximate nearest neighbor (ANN) index for fast similarity search.

---

### 2) Query pipeline (real‑time)

This is what happens when a user asks a question:

1. **Embed the query**
   - Convert the user’s question into a vector using the same embedding model as ingestion.[1][3]

2. **Retrieve top‑k chunks**
   - Perform semantic search in the vector store to find the most similar chunks.[2][7][1]
   - Optionally apply metadata filters (e.g., by doc type, date, tenant).

3. **Augment the prompt**
   - Take the retrieved chunks and inject them into the LLM prompt as context.[3][6][8]
   - Typical pattern:
     - System message: “You are a helpful assistant. Answer using the context below; if unsure, say so.”
     - Context: “Relevant documents: …”
     - User query: “…”

4. **Generate the response**
   - The LLM (generator) produces an answer conditioned on both the query and the retrieved context.[5][7][2]
   - This grounding reduces hallucinations and keeps answers tied to your data.

5. **Return & log**
   - Send the response back to the user.
   - Log query, retrieved chunks, and response for observability and evaluation.[9]

_RAG flow: query → retrieve from knowledge sources → augment prompt → LLM generates response._

## Core components (logical view)

- **External knowledge base** – Your authoritative data (docs, DBs, APIs).[6][10]
- **Encoder / embedding model** – Turns text (chunks & queries) into vectors for semantic search.[5][7]
- **Retriever** – Searches the index and ranks chunks by relevance.[2][7][11]
- **Generator (LLM)** – Uses the augmented prompt to generate coherent, grounded answers.[7][2][5]
- **Orchestrator / integration layer** – Coordinates retrieval, prompt construction, and LLM calls (often your API/backend service).[9][7]

## How this looks on Azure (brief mapping)

Given your stack, a typical Azure RAG architecture might be:

- **Ingestion**: Azure Functions / Logic Apps + .NET service to chunk & embed docs.[4][9]
- **Vector store**: Azure AI Search with vector indexes (or Cosmos DB with vector support).[9][4]
- **Query API**: ASP.NET Core service that:
  - Embeds the query (Azure OpenAI embedding model)
  - Calls Azure AI Search for top‑k results
  - Builds the prompt and calls Azure OpenAI chat completion
- **Observability**: Application Insights for tracing retrieval, latency, and responses.[9]

If you want, I can sketch a concrete .NET + Azure AI Search + Azure OpenAI reference architecture with request/response flows and key code snippets.

## Sources

[1] RAG Architecture https://www.geeksforgeeks.org/nlp/rag-architecture/
[2] RAG Architecture Explained: A Comprehensive Guide [2026] https://orq.ai/blog/rag-architecture
[3] RAG Architecture Explained: How Retrieval-Augmented ... https://bigdataboutique.com/blog/rag-architecture-explained-how-retrieval-augmented-generation-works
[4] What is Retrieval Augmented Generation (RAG)? https://www.databricks.com/blog/what-is-retrieval-augmented-generation
[5] Enhancing knowledge base interactions with RAG ... https://logic2020.com/insight/enhancing-knowledge-base-interactions-with-rag-architecture/
[6] Retrieval-Augmented Generation (RAG) https://www.pinecone.io/learn/retrieval-augmented-generation/
[7] How RAG architecture improves knowledge base interactions https://utilityanalytics.com/how-rag-architecture-improves-knowledge-base-interactions/
[8] Introduction to LLM RAG - Retrieval Augmented ... https://weaviate.io/blog/introduction-to-rag
[9] Design and Develop a RAG Solution on Azure https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide
[10] Introduction To Undertsanding RAG(Retrieval-Augmented ... https://www.youtube.com/watch?v=fZM3oX4xEyg
[11] RAG Architecture: Components, Timing & Design Patterns https://mbrenndoerfer.com/writing/rag-architecture-retriever-generator-design-patterns
[12] What is RAG (Retrieval Augmented Generation)? https://www.ibm.com/think/topics/retrieval-augmented-generation
[13] A practical guide to Retrieval-Augmented Generation (RAG) https://www.k2view.com/what-is-retrieval-augmented-generation
[14] What is Retrieval-Augmented Generation (RAG)? https://www.nvidia.com/en-us/glossary/retrieval-augmented-generation/
[15] RAG Architecture: 4 Key Components & Example ... https://cloudian.com/guides/ai-infrastructure/rag-architecture-4-key-components-example-implementation-2026/
