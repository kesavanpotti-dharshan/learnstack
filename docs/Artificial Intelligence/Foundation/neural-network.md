---
title: Neural Network Fundamentals
sidebar_label: Neural Network
sidebar_position: 4
---

Modern generative AI combines several ideas: neural networks learn numeric patterns; tokenization converts text into model-readable pieces; Transformers use attention to relate those pieces to one another; and sampling settings such as temperature and top-p control how the model selects each next token during generation.[1][2]

```text
Text prompt
   ↓
Tokenization
   ↓
Token IDs → embeddings
   ↓
Transformer blocks
   └─ attention + neural-network layers
   ↓
Scores for possible next tokens
   ↓
Temperature / top-p sampling
   ↓
Next token → repeat → generated response
```

## Neural-network fundamentals

A **neural network** is a machine-learning model made of layers of simple numerical operations. It learns a mapping from inputs to outputs by adjusting internal values called **parameters**, especially weights and biases.

```text
Input features
   ↓
Hidden layer(s)
   ↓
Output layer
   ↓
Prediction
```

For a simplified artificial neuron:

$$
z = w_1x_1 + w_2x_2 + \cdots + w_nx_n + b
$$

$$
a = \phi(z)
$$

Where:

- $x_1, x_2, \ldots, x_n$ are input values.
- $w_1, w_2, \ldots, w_n$ are learned **weights**.
- $b$ is a learned **bias**.
- $\phi$ is an activation function.
- $a$ is the neuron’s output.

### Intuition

Imagine a spam classifier with these inputs:

```text
x₁ = email contains “free”
x₂ = email contains “prize”
x₃ = sender is unknown
```

The network learns weights expressing how strongly each signal contributes to a spam prediction.

```text
Large positive weight → feature increases spam likelihood
Large negative weight → feature reduces spam likelihood
Near-zero weight      → feature has little effect
```

A deep neural network has many layers, letting it learn increasingly abstract patterns:

```text
Image:
pixels → edges → textures → object parts → object label

Language:
characters/tokens → word patterns → phrases → concepts/relationships → next-token probabilities
```

### Training: how it learns

A network starts with initial parameter values, makes a prediction, measures its error using a **loss function**, and adjusts parameters to reduce that error.

```text
Training example
   ↓
Forward pass: model predicts
   ↓
Loss: compare prediction vs. target
   ↓
Backpropagation: calculate parameter contributions to error
   ↓
Optimizer: adjust weights and biases
   ↓
Repeat across many examples
```

A common update idea is:

$$
\theta \leftarrow \theta - \eta \nabla_{\theta} L(\theta)
$$

Where $\theta$ represents parameters, $L$ is the loss, and $\eta$ is the learning rate.

At inference time, the trained weights are normally fixed; the model only calculates outputs for new input.

## Tokenization and embeddings

Computers do not directly process words or sentences. An LLM first uses a **tokenizer** to split text into tokens—often word pieces, punctuation, spaces, or code fragments—not necessarily complete words.[2][3]

```text
Text:
“React is powerful!”

Conceptual token split:
["React", " is", " powerful", "!"]
```

The exact tokenization depends on the model. A rare word, URL, emoji, source-code symbol, or non-English text may split into many tokens.

```text
Prompt text
   ↓
Tokenizer
   ↓
Token IDs
   ↓
Embeddings: dense numeric vectors
```

For example:

```text
"cat" → token ID 4912 → embedding [0.14, -0.62, 0.09, ...]
```

An **embedding** is a vector of learned numbers that gives a token an initial machine-readable representation. During Transformer processing, the representation becomes **contextual**: the representation for “bank” differs in “river bank” versus “bank account.”

### Position matters

Attention alone does not inherently know the order of tokens. Transformers therefore add positional information to token embeddings.

```text
“Dog bites man” ≠ “Man bites dog”
```

The model needs both token identity and token position to interpret sequence meaning.

## Transformers

A **Transformer** is a neural-network architecture built around attention. It is the dominant architecture behind many modern language models and many multimodal models. Its core advantage is that tokens can exchange information with relevant tokens across the context, rather than processing text strictly one word at a time.[1][2]

```text
Token embeddings + positional information
                ↓
Transformer block 1
  ├─ multi-head self-attention
  ├─ residual connection + normalization
  └─ feed-forward neural network
                ↓
Transformer block 2
                ↓
...
                ↓
Final token representations
                ↓
Linear layer + softmax
                ↓
Next-token probability distribution
```

A typical Transformer block contains:

- **Self-attention**: each token gathers relevant information from other tokens.
- **Multi-head attention**: several attention patterns are learned in parallel.
- **Feed-forward network (MLP)**: transforms each token’s representation independently after attention mixes contextual information.
- **Residual connections**: preserve prior information and make deep networks train more reliably.
- **Layer normalization**: keeps activations numerically stable.

### Decoder-only Transformers

Many text-generating LLMs are **decoder-only Transformers**. When generating the next token, each token is prevented from attending to future tokens—called **causal masking**.

```text
Input: “The capital of France is”

Allowed context for next token:
“The” → can see itself
“capital” → can see “The”, “capital”
“France” → can see prior tokens
“is” → can see all earlier tokens

Not allowed:
Seeing the answer token before predicting it
```

This supports autoregressive generation:

```text
Prompt
  ↓
Predict next token
  ↓
Append token to context
  ↓
Predict next token again
  ↓
Repeat until completion
```

## Attention

**Attention** lets a token decide which other tokens matter most when building its contextual representation. The key idea is not that every word contributes equally.

Example:

```text
“The animal didn’t cross the street because it was tired.”

What does “it” refer to?
→ likely “the animal”
```

Attention can learn to assign a stronger relationship between “it” and “animal” than between “it” and “street.”

### Query, key, and value

For every token representation, the Transformer learns three derived vectors:

- **Query (Q):** what this token is looking for.
- **Key (K):** what information this token offers.
- **Value (V):** the information to retrieve if the token is relevant.[1]

```text
Current token's Query
        |
        | compare with
        v
Keys of all allowed tokens
        |
        v
Attention scores / relevance weights
        |
        v
Weighted combination of Values
        |
        v
Context-aware representation for current token
```

The standard scaled dot-product attention formula is:

$$
\text{Attention}(Q,K,V)
=
\text{softmax}
\left(
\frac{QK^T}{\sqrt{d_k}}
\right)V
$$

Interpretation:

1. Compute similarity between a Query and available Keys.
2. Scale scores to keep training stable.
3. Use softmax to turn scores into attention weights that sum to 1.
4. Compute a weighted combination of Value vectors.

### Mini conceptual example

Consider:

```text
“The cat sat on the mat because it was warm.”
```

When processing “it,” an attention head may allocate weight roughly like:

```text
cat  → 0.10
mat  → 0.55
warm → 0.20
other words → 0.15
```

That would make “it” more strongly connected to “mat” in this particular context. Actual Transformers learn many such relationships automatically, and a single attention head’s weights should not be treated as a complete human-readable explanation of the model’s reasoning.

### Multi-head attention

Transformers use multiple attention heads rather than only one. Each head can learn different relation patterns:

```text
Head 1 → nearby syntax / grammatical agreement
Head 2 → pronoun-reference patterns
Head 3 → long-distance topic relationship
Head 4 → punctuation/format structure
...
```

Their outputs are combined so the model can use multiple contextual views simultaneously.

### Self-attention versus cross-attention

| Type            | What attends to what?                                        | Typical use                                        |
| --------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| Self-attention  | Tokens in one sequence attend to tokens in the same sequence | Standard LLM text processing                       |
| Cross-attention | One sequence attends to representations from another source  | Translation, image-to-text, encoder-decoder models |

A vision-language model, for example, may use cross-attention so text tokens can attend to image features.

## From logits to probabilities

After processing the context, an LLM produces a score—called a **logit**—for every possible next token in its vocabulary.

```text
Prompt: “The capital of France is”

Candidate token       Raw logit
------------------    ---------
" Paris"                9.2
" Lyon"                 4.1
" London"               1.3
" banana"              -5.7
```

A softmax function converts logits into probabilities:

$$
P(t_i) =
\frac{e^{z_i}}
{\sum_j e^{z_j}}
$$

Where $z_i$ is the logit for candidate token $t_i$.

```text
Candidate token       Probability
------------------    -----------
" Paris"                0.986
" Lyon"                 0.013
" London"               0.001
" banana"               ~0
```

The model does not normally “look up” a factual answer from a database at this point. It predicts a probability distribution based on its learned parameters and the supplied context. Tool use, retrieval-augmented generation, and external databases can add grounded information around this process.

## Sampling and decoding

**Decoding** is the method used to select one token from the next-token probability distribution. The chosen token becomes part of the context, and generation repeats token by token.[1][2]

```text
Context
   ↓
Model produces logits
   ↓
Apply decoding controls
   ↓
Select next token
   ↓
Append it to context
   ↓
Repeat
```

### Greedy decoding

Greedy decoding always selects the token with the highest probability:

```text
P(" Paris")  = 0.60
P(" Lyon")   = 0.25
P("Marseille") = 0.15

Greedy choice → " Paris"
```

It is predictable but can be repetitive, overly rigid, or prone to locally plausible but globally weak sequences.

### Temperature

**Temperature** changes the sharpness of the next-token distribution before sampling. It scales logits before softmax:

$$
P(t_i) =
\text{softmax}
\left(
\frac{z_i}{T}
\right)
$$

where $T$ is temperature.[2][4]

| Temperature          | Effect                                                      | Good fit                                                             |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| Near 0               | Almost deterministic; strongly favors the most likely token | Structured extraction, tightly constrained outputs                   |
| Low, e.g. 0.1–0.3    | More focused and consistent                                 | Technical summaries, classification-like tasks, code with validation |
| Medium, e.g. 0.5–0.8 | Balance of coherence and variation                          | General assistant responses                                          |
| High, e.g. 1.0+      | More diverse and unpredictable                              | Brainstorming, creative writing, idea variation                      |

```text
Low temperature:
[0.80, 0.12, 0.05, 0.03]
          ↓ sharpens
[0.96, 0.03, 0.01, ~0]

High temperature:
[0.80, 0.12, 0.05, 0.03]
          ↓ flattens
[0.50, 0.22, 0.16, 0.12]
```

Lower temperature does **not** make a model factually reliable. It only makes the model more likely to repeat its highest-probability continuation. A confident error can become more consistent, not more correct.

### Top-p / nucleus sampling

**Top-p**, also called **nucleus sampling**, keeps the smallest set of candidate tokens whose cumulative probability reaches a chosen threshold $p$, then samples only from that set.[2][4][5]

Example with $p = 0.90$:

```text
Candidate      Probability     Cumulative
-----------    -----------     ----------
" Paris"         0.55            0.55
" Lyon"          0.20            0.75
" Marseille"     0.10            0.85
" Nice"          0.06            0.91  ← include; threshold reached
" banana"        0.01            excluded
" spaceship"     0.001           excluded
```

The candidate pool becomes:

```text
[" Paris", " Lyon", " Marseille", " Nice"]
```

The probabilities are then renormalized, and a token is selected from this smaller pool.

Why top-p is useful:

- When the model is highly confident, the nucleus may contain only a few tokens.
- When the model is uncertain, it can include more alternatives.
- It adaptively restricts low-probability, often off-topic tokens.

### Top-k compared

**Top-k** keeps a fixed number of the most probable candidates. **Top-p** keeps a variable number sufficient to reach cumulative probability $p$.[2][5][6]

| Setting     | Rule                                                 | Example                           |
| ----------- | ---------------------------------------------------- | --------------------------------- |
| Greedy      | Pick highest-probability token                       | Always select rank 1              |
| Top-k       | Keep exactly the $k$ most likely tokens              | Keep top 50                       |
| Top-p       | Keep smallest candidate set totaling probability $p$ | Keep enough tokens to reach 0.90  |
| Temperature | Reshape probability distribution                     | Lower = sharper; higher = flatter |

Some model APIs apply these controls in a particular order, and providers can differ. Follow the API’s documentation rather than assuming one universal pipeline.

## Practical settings

There is no universally best temperature or top-p. They depend on the model, task, prompt, output constraints, and evaluation method.

| Task                                      | Reasonable starting direction                                     | Why                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Strict JSON / extraction / classification | Low temperature; schema validation; possibly constrained decoding | Variation is usually undesirable                                             |
| Code generation                           | Low-to-medium temperature plus tests/linting                      | Consistency matters, but alternatives can help                               |
| Factual answer                            | Low-to-medium temperature plus retrieval/citations/verification   | Sampling settings cannot guarantee truth                                     |
| Brainstorming                             | Medium-to-higher temperature; moderate/high top-p                 | Diverse alternatives are valuable                                            |
| Fiction/dialogue                          | Higher temperature; higher top-p                                  | Variation and novelty are useful                                             |
| Safety-critical decision                  | Do not rely on sampling alone                                     | Use rules, validation, retrieval, human review, and domain-specific controls |

A useful operational principle is to change **one control at a time**, evaluate output quality, and record results. Avoid assuming that a higher temperature means “smarter” or that a lower temperature means “safer.”

## End-to-end example

Prompt:

```text
“Write a one-sentence explanation of attention in Transformers.”
```

```text
1. Tokenization
   Text becomes token IDs.

2. Embedding
   Each ID becomes a learned numeric vector; position information is added.

3. Transformer processing
   Attention lets each token draw context from relevant earlier tokens.
   Feed-forward layers further transform these contextual representations.

4. Next-token scores
   The model produces logits for every token in the vocabulary.

5. Decoding
   Temperature scales logits.
   Top-p removes low-probability candidates.
   The system samples or selects the next token.

6. Autoregressive repetition
   The new token is appended and the model predicts another token.

7. Output
   Tokens are detokenized into readable text.
```

Possible answer:

```text
“Attention lets each token weigh the relevance of other tokens in the context,
allowing a Transformer to build context-aware representations.”
```

## Key boundaries

- A **neural network** is the broad model family; a **Transformer** is a particular neural-network architecture.
- **Attention** is a mechanism within Transformers, not the entire Transformer.
- **Tokenization** happens before the model processes language; it is not the same as an embedding.
- An **embedding** is a learned vector representation of a token or input.
- **Inference** calculates next-token scores; **sampling** decides which candidate token is emitted.
- **Temperature** changes the distribution’s shape; **top-p** restricts the candidate pool.
- Lower randomness affects consistency, not truthfulness. Grounding and verification require retrieval, reliable sources, validation, or tools.

## Interview answer

> A neural network learns a mapping from inputs to outputs by adjusting weights and biases to reduce a loss during training. A Transformer is a neural-network architecture that processes token embeddings with repeated self-attention and feed-forward layers. Attention allows each token to assign different relevance to other tokens using learned query, key, and value vectors, producing context-aware representations. Before processing, tokenization splits text into model-specific token units and embeddings convert those token IDs into vectors. For generation, the model outputs logits over possible next tokens; softmax converts them into probabilities. Temperature scales logits—lower values make choices more deterministic, higher values increase diversity—while top-p, or nucleus sampling, restricts choices to the smallest set of tokens whose cumulative probability reaches a threshold. The model then selects a token and repeats the process autoregressively.[1][2][4][5]

## Sources

[1] What Are Large Language Models (LLMs)? https://www.ibm.com/think/topics/large-language-models
[2] LLM Transformer Model Visually Explained https://poloclub.github.io/transformer-explainer/
[3] Lexicon - Chief Digital and Artificial Intelligence Office https://www.ai.mil/Lexicon/
[4] The Statistics of Token Selection: Logits, Temperature, and ... https://machinelearningmastery.com/the-statistics-of-token-selection-logits-temperature-and-top-p-walkthrough/
[5] About topK, topP and temprature - Google AI Studio https://discuss.ai.google.dev/t/about-topk-topp-and-temprature/33094
[6] Understanding Temperature, Top-k, and Top-p Sampling in ... https://codefinity.com/blog/Understanding-Temperature,-Top-k,-and-Top-p-Sampling-in-Generative-Models
[7] Sampling in Text Generation.ipynb https://colab.research.google.com/github/kmkarakaya/ML_tutorials/blob/master/Sampling_in_Text_Generation.ipynb
