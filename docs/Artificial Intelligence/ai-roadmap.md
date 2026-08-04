# Artificial Intelligence - Basic to Architect Level

## 1. Foundations

- Python (async/await, typing, packaging)
- Linear algebra, probability, statistics (applied, not derivation-heavy)
- ML basics: supervised/unsupervised, train/test/val, overfitting, metrics
- Neural network fundamentals, transformers, attention, tokenization, sampling (temperature/top-p)

## 2. LLM Application Development

- LLM API mastery (Anthropic, OpenAI, Bedrock, Azure OpenAI) — multi-provider fluency
- Prompt engineering as system design (system prompts as software contracts)
- Structured outputs, function/tool calling
- Context window management, prompt caching
- Frameworks: LangChain, LangGraph, Claude Agent SDK, CrewAI

## 3. RAG & Knowledge Systems

- Embeddings, vector databases (pgvector, Pinecone, Weaviate)
- Chunking strategies, hybrid search, re-ranking
- RAG evaluation (faithfulness, relevance, context precision/recall)
- Knowledge graphs / ontology-based retrieval (Palantir-style)

## 4. Agents & Orchestration

- Single-agent vs multi-agent architecture
- Tool use, MCP (Model Context Protocol) — building/consuming MCP servers
- Stateful workflows, memory (short/long-term)
- Human-in-the-loop checkpoints, least-privilege tool design
- Failure modes: LLM06 Excessive Agency, kill switches

## 5. Evaluation & Observability

- Golden datasets, LLM-as-a-judge
- Eval pipelines (ragas, custom harnesses)
- Tracing (LangSmith, OpenTelemetry)
- Regression testing for non-deterministic systems

## 6. Fine-Tuning & Model Adaptation

- When to fine-tune vs prompt vs RAG
- LoRA/QLoRA, domain adaptation
- Model routing (cheap model for extraction, strong model for reasoning)

## 7. Deployment & LLMOps

- Containerization, serving (vLLM), serverless (Lambda, Cloud Run)
- CI/CD for AI systems, rollback strategies
- Cost optimization (caching, routing, context compression)
- Monitoring drift, latency, and quality in production

## 8. Security & Governance

- Guardrails, prompt injection defense
- Data privacy, compliance (EU AI Act, NIST AI RMF)
- Access control for agentic tool use

## 9. Architect-Level: Systems & Strategy

- Enterprise AI architecture (multi-tenant, hybrid cloud)
- Agent Architect track: multi-agent system design, safety ownership
- Migration path: PoC → pilot → production at scale
- Vendor/model strategy (build vs buy, lock-in tradeoffs)

## 10. Forward Deployed Engineer Layer (client-facing + delivery)

- Rapid discovery: translating ambiguous business problems into technical scope
- Building customer-specific ontologies/data models
- "Bootcamp" delivery model — ship working software in days, not decks
- Executive communication, running technical trust-building in week one
- Domain immersion (industry-specific compliance/workflows)
- Feeding field learnings back into product roadmap
