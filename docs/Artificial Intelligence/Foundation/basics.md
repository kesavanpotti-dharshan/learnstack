---
title: Basics of Artifical Intelligence
sidebar_label: Basics
sidebar_position: 1
---

**Artificial Intelligence (AI)** is the broad field of building systems that make predictions, recommendations, or decisions toward human-defined objectives. **Machine Learning (ML)** is a major approach within AI that learns patterns from data; **Deep Learning (DL)** is a subset of ML based on multi-layer neural networks; and **Generative AI (GenAI)** is AI designed to generate new, synthetic content such as text, images, audio, video, or code.[1][2]

## The relationship

The usual hierarchy is:

```text
Artificial Intelligence (AI)
│
├── Rule-based / symbolic AI
├── Search, planning, optimization, robotics
├── Machine Learning (ML)
│   ├── Classical ML
│   ├── Reinforcement learning
│   └── Deep Learning (DL)
│       ├── CNNs, RNNs, Transformers
│       └── Many modern Generative AI models
│
└── Generative AI (GenAI)
    └── Usually built with deep learning, but defined by what it does:
        generates new content
```

The important caveat: the diagram is useful, but GenAI is partly a **capability category**, while ML and DL are primarily **technical/modeling categories**.

- AI asks: “Can a system perform an intelligent task?”
- ML asks: “Can the system learn behavior from data?”
- DL asks: “Can it learn using many-layer neural networks?”
- GenAI asks: “Can it create new content similar in structure to its learned data?”

NIST defines AI as a machine-based system that, for human-defined objectives, makes predictions, recommendations, or decisions that influence real or virtual environments.[1]

## Artificial Intelligence

**AI** is the broadest umbrella. It includes systems that perform tasks associated with intelligent behavior—such as reasoning, planning, perception, decision-making, language processing, or control.

AI does **not** necessarily need to learn from data.

### Examples of AI that are not ML

```text
A chess program based on hand-written rules and search
A route planner using graph-search algorithms
A rule-based medical eligibility engine
A scheduling/optimization system
An expert system with if–then rules
```

Example rule-based system:

```js
if (income < 20000 && householdSize >= 4) {
  eligibility = "eligible";
} else {
  eligibility = "not eligible";
}
```

That system may be AI-like automation or decision support, but it has no learned model. A developer specified the rules.

### AI boundary

AI is not synonymous with:

- Any software with automation.
- A chatbot.
- A neural network.
- Machine learning.
- Human-level intelligence or consciousness.

A calculator, spreadsheet formula, or basic scripted workflow is normally not described as AI merely because it automates a task. The boundary can be fuzzy in marketing, so it is more useful to identify the system’s actual method: rules, optimization, statistical ML, neural network, or generative model.

## Machine Learning

**Machine Learning** is a subset of AI in which a model learns useful patterns from data rather than relying only on explicitly written rules.

```text
Traditional programming:
Rules + Data → Output

Machine learning:
Data + Desired outcomes / feedback → Model
Model + New data → Prediction or decision
```

Example: spam detection.

```text
Training data:
Email text + label ("spam" or "not spam")
             |
             v
ML training process
             |
             v
Trained spam classifier
             |
             v
New email → probability of spam
```

A typical ML model receives inputs and produces a prediction, classification, score, ranking, or action.

### Main ML categories

| ML type                  | Training signal                         | Typical task                         | Example                                 |
| ------------------------ | --------------------------------------- | ------------------------------------ | --------------------------------------- |
| Supervised learning      | Labeled examples                        | Predict a known target               | Fraud/no-fraud classification           |
| Unsupervised learning    | Unlabeled data                          | Discover groups or structure         | Customer segmentation                   |
| Semi-supervised learning | Few labels plus many unlabeled examples | Improve learning with limited labels | Image classification with scarce labels |
| Reinforcement learning   | Rewards/penalties from interaction      | Learn a sequence of actions          | Game-playing agent or robot policy      |

### Common non-generative ML outputs

```text
“This transaction has a 92% fraud risk.”
“This customer is likely to churn.”
“This image contains a cat.”
“Demand next week is estimated at 1,200 units.”
“Recommend these three products.”
```

These are primarily **predictive** or **discriminative** tasks: the model maps input data to a label, probability, value, ranking, or action.

## Deep Learning

**Deep Learning** is a subset of ML that uses neural networks with multiple layers. “Deep” refers to the many layers that learn increasingly abstract representations of input data.[3]

```text
Input image
   |
   v
Early layers: edges and simple shapes
   |
   v
Middle layers: textures and parts
   |
   v
Later layers: objects and semantic patterns
   |
   v
Output: “golden retriever” / “bicycle” / “tumor likely”
```

Deep learning is especially effective for unstructured, high-dimensional data:

- Text and speech.
- Images and video.
- Audio.
- Complex sensor data.
- Large-scale recommendation and ranking.
- Biological sequences and scientific data.

### Deep learning architectures

| Architecture                              | Common use                                                        |
| ----------------------------------------- | ----------------------------------------------------------------- |
| Feed-forward neural network / MLP         | Tabular and general prediction tasks                              |
| Convolutional neural network (CNN)        | Images and spatial data                                           |
| Recurrent neural network (RNN), LSTM, GRU | Historical sequence modeling                                      |
| Transformer                               | Language, multimodal systems, modern foundation models            |
| Autoencoder                               | Representation learning, denoising, anomaly detection, generation |
| GAN                                       | Synthetic images and other generated data                         |
| Diffusion model                           | Image, audio, video generation                                    |

Not every neural network is necessarily “deep” in the practical modern sense, but deep learning generally refers to neural networks with multiple learned layers.

### Boundary: ML versus DL

```text
All deep learning is machine learning.
Not all machine learning is deep learning.
```

Examples of ML that are not deep learning:

```text
Linear/logistic regression
Decision trees
Random forests
Gradient-boosted trees
Support vector machines
k-nearest neighbors
k-means clustering
```

For small, structured tabular datasets—such as a loan-risk dataset with columns for income, debt ratio, and repayment history—classical ML can be cheaper, easier to train, and easier to explain than deep learning.

## Generative AI

**Generative AI** produces new content. NIST defines it as a class of AI models that emulate the structure and characteristics of input data in order to generate derived synthetic content, including text, images, video, audio, and other digital content.[2][4]

```text
Prompt or input
      |
      v
Generative model
      |
      v
New content:
text, code, image, audio, video, 3D asset, molecule, etc.
```

Examples:

```text
Prompt: “Write a project-status email.”
Output: Newly generated email draft.

Prompt: “Create a watercolor illustration of a lighthouse.”
Output: Newly generated image.

Prompt: “Write a Python function to parse a CSV.”
Output: Newly generated code.

Prompt: “Summarize this report.”
Output: Newly generated summary.
```

Modern GenAI is commonly based on deep learning, especially Transformer models for language and multimodal work, and diffusion models for images and video. But **Generative AI is defined by the output behavior**, not by the exact model family.

### Generative versus predictive AI

| Question          | Predictive / discriminative ML             | Generative AI                                                       |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Main output       | Label, score, ranking, forecast, decision  | New content/data                                                    |
| Example input     | Transaction details                        | Prompt or source material                                           |
| Example output    | “Fraud risk: 0.92”                         | A written fraud-investigation summary                               |
| Typical objective | Estimate \(P(y \mid x)\)                   | Model/generate data resembling \(P(x)\), often conditioned on input |
| Typical use       | Classification, regression, recommendation | Writing, coding, images, audio, synthesis                           |

A system can combine both:

```text
ML fraud model → identifies high-risk transaction
        |
        v
GenAI assistant → drafts a clear analyst case summary
```

## Foundation models and LLMs

Many current GenAI products use **foundation models**: broadly trained models that can be adapted to many downstream tasks. NIST’s cited definition describes a foundation model as trained on broad data, generally using self-supervision, and applicable across a wide range of contexts.[4]

A **Large Language Model (LLM)** is a Generative AI model specialized in producing and transforming language. It predicts likely next tokens based on context.

```text
Input: “The capital of France is”
                |
                v
Model predicts likely next token: “ Paris”
```

Repeated token prediction can produce:

- Conversational answers.
- Summaries.
- Translations.
- Code.
- Structured JSON.
- Drafts and explanations.

However, an LLM does not inherently verify facts, possess intent, or guarantee truth. It generates plausible continuations from learned patterns and the supplied context. Production systems often combine an LLM with retrieval, databases, business rules, validation, and human review.

## Boundaries at a glance

| Term  | What it is                                   | Must learn from data? |  Must use neural networks? |     Must generate content? | Example                   |
| ----- | -------------------------------------------- | --------------------: | -------------------------: | -------------------------: | ------------------------- |
| AI    | Broad field/system category                  |                    No |                         No |                         No | Rule-based route planner  |
| ML    | AI method that learns from data              |                   Yes |                         No |                         No | Churn prediction model    |
| DL    | ML method using multi-layer neural networks  |                   Yes |                        Yes |                         No | Image classifier          |
| GenAI | AI capability that creates synthetic content |               Usually | Usually, in modern systems |                        Yes | Text/image/code generator |
| LLM   | Language-focused GenAI model                 |                   Yes |  Usually Transformer-based | Yes, language/token output | Chat assistant            |

[1][2][3][4]

## A simple analogy

Imagine teaching systems to work with photographs of animals:

```text
AI:
Any approach that helps a computer identify or reason about animals.

Rule-based AI:
“If it has stripes, classify it as a zebra.”
No learning; rules are hand-written.

ML:
Show thousands of labeled animal photos.
The system learns which visual patterns predict “zebra.”

Deep learning:
Use a deep neural network to learn visual features directly:
edges → textures → legs/ears → whole animal.

Generative AI:
Train a model to create a new image from:
“a zebra standing in a snowy forest.”
```

The first three can classify an animal. Generative AI creates a new example.

## Important misconceptions

### “AI always means ChatGPT-like tools”

No. Chatbots based on LLMs are GenAI, but AI also includes optimization, robotics, computer vision, search, planning, rules, recommendation, and predictive ML.

### “All AI uses ML”

No. Rule-based systems, search algorithms, planning systems, and optimization can be AI without training a model from data.

### “All ML is deep learning”

No. Many widely used models—linear regression, random forests, gradient boosting, and clustering—are ML but not deep learning.

### “All deep learning is Generative AI”

No. Deep neural networks can classify images, detect fraud, forecast sales, transcribe speech, or rank search results without generating new content.

### “Generative AI is always an LLM”

No. LLMs generate language, while diffusion models generate images/audio/video and other architectures can generate synthetic data, molecules, or 3D objects.

## Practical selection guide

| Business problem                                          | Often start with                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Apply fixed policy/eligibility rules                      | Rules engine or conventional software                                            |
| Predict churn, demand, fraud, or risk                     | Classical ML or DL, depending on data scale/type                                 |
| Detect objects in camera images                           | Deep learning computer vision                                                    |
| Draft/summarize/translate text or generate code           | Generative AI / LLM                                                              |
| Generate images, video, audio, or synthetic examples      | Generative AI                                                                    |
| Build a user-facing assistant that must cite company data | GenAI plus retrieval, access control, validation, and monitoring                 |
| Make decisions with high-stakes, regulated impact         | Auditable models/rules, testing, human oversight, and governance—not GenAI alone |

NIST’s Generative AI risk-management profile exists because GenAI introduces distinct reliability, security, privacy, provenance, and misuse concerns that organizations should manage deliberately.[4][5]

## Interview answer

> AI is the broad field of systems that make predictions, recommendations, or decisions to achieve human-defined goals. Machine learning is a subset of AI that learns patterns from data instead of relying entirely on hand-coded rules. Deep learning is a subset of machine learning that uses multi-layer neural networks, especially effective for text, images, audio, and other unstructured data. Generative AI is defined by its ability to generate new synthetic content—such as text, code, images, audio, or video—and most modern GenAI uses deep learning models such as Transformers or diffusion models. Therefore, all deep learning is ML and AI, but not all ML is DL; GenAI overlaps heavily with DL but is best understood as a content-generating capability rather than simply another algorithm family.[1][2][3][4]

## Sources

[1] artificial intelligence - Glossary | CSRC https://csrc.nist.gov/glossary/term/artificial_intelligence
[2] generative artificial intelligence - Glossary | CSRC https://csrc.nist.gov/glossary/term/generative_artificial_intelligence
[3] Discover the differences between ai, ml and deep learning https://www.sumologic.com/blog/machine-learning-deep-learning
[4] [PDF] Artificial Intelligence Risk Management Framework: Generative ... https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
[5] AI Risk Management Framework - NIST https://www.nist.gov/itl/ai-risk-management-framework
[6] Artificial intelligence | NIST https://www.nist.gov/artificial-intelligence
[7] Glossary - AIRC - NIST AI Resource Center https://airc.nist.gov/glossary/
[8] Latest NIST Guidance Identifies Generative AI Risks and ... https://www.dwt.com/blogs/artificial-intelligence-law-advisor/2024/08/new-nist-guidance-on-generative-ai-risks
[9] Generative Artificial Intelligence Risk & NIST AI RMF - RSI Security https://blog.rsisecurity.com/generative-artificial-intelligence-nist-ai-rmf/
[10] CSRC Topics - artificial intelligence https://csrc.nist.rip/Topics/Technologies/artificial-intelligence
