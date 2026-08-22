---
title: Key Terminologies
sidebar_label: Key Terminologies
sidebar_position: 3
---

These terms describe the lifecycle of an AI system: **data is represented as tokens**, a **model** with adjustable **parameters/weights** is **trained** to learn patterns, and then it performs **inference** to produce an output for new input.[1][2][3]

```text
Training data
   ↓
Tokens / numeric representations
   ↓
Training adjusts weights and other learned parameters
   ↓
Trained model
   ↓
Inference on new input
   ↓
Prediction, classification, recommendation, or generated text
```

## Core definitions

| Term       | Plain definition                                                                                | Example                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Model      | The learned computational structure plus its parameter values that converts input into output   | A model that predicts whether an email is spam                                    |
| Training   | The process of learning model parameters from data by reducing error or optimizing an objective | Showing many labeled emails to a spam model                                       |
| Parameters | Internal numeric values learned during training; in neural networks, mainly weights and biases  | Billions of learned values in an LLM                                              |
| Weights    | A common kind of learned parameter that controls how strongly one input/unit affects another    | A large positive weight may make “free prize” contribute strongly to a spam score |
| Inference  | Using a trained model’s learned parameters to produce an output for new input                   | Sending a new email to the spam model for classification                          |
| Token      | A unit of data a model processes; for LLMs, often a word piece rather than a full word          | `"unbelievable"` may be split into multiple tokens                                |

Google’s ML glossary describes a model as the structure and set of parameters needed to make predictions; it defines parameters as learned weights and biases, training as determining ideal weights, and inference as using learned weights to make predictions.[1]

## Model

A **model** is the mathematical/computational mechanism that transforms input into output. It includes:

1. An **architecture** or structure—such as linear regression, a decision tree, a convolutional neural network, or a Transformer.
2. The learned **parameter values**—the numbers acquired during training.
3. Often, associated input/output handling, such as tokenization, normalization, and decoding rules.

```text
Input: “This offer is urgent—claim your prize!”
                 |
                 v
           Trained model
                 |
                 v
Output: Spam probability = 0.97
```

A model is not the same thing as an entire AI product.

```text
AI application/product
  ├─ User interface
  ├─ Prompt/data-processing pipeline
  ├─ Retrieval or database access
  ├─ Business rules and safety checks
  ├─ Monitoring and logging
  └─ One or more AI models
```

For example, a support chatbot may use an LLM, a search/retrieval system, a company-document store, authentication, access controls, moderation, and an application UI. The LLM is only one component.

The NTIA similarly describes an AI model as a component of an AI system that applies AI techniques to produce outputs from inputs.[2]

## Parameters and weights

A **parameter** is a value the model learns from training data. In a neural network, the main learned parameters are:

- **Weights**
- **Biases**

```text
Parameters = weights + biases
```

A **weight** is a numerical multiplier that determines how much one input, feature, or neuron influences another.[1][3]

### Simple linear example

A simple model predicting house price might look like:

$$
\text{price} =
w_1(\text{square footage}) +
w_2(\text{bedrooms}) +
w_3(\text{location score}) +
b
$$

Where:

- \(w_1, w_2, w_3\) are weights.
- \(b\) is a bias.
- All of these are learned parameters.

If training learns that square footage is important, it may assign a relatively larger weight to that feature.

### Neural-network example

A simplified neuron computes:

$$
z = w_1x_1 + w_2x_2 + \cdots + w_nx_n + b
$$

Then an activation function transforms \(z\) before it flows to the next layer.

```text
Inputs: x₁, x₂, x₃
          │   │   │
          ×w₁ ×w₂ ×w₃
           \  |  /
            weighted sum + bias
                    |
                    v
              activation output
```

Modern large language models can have millions, billions, or more parameters. More parameters increase memory use and usually increase training and inference cost, though more parameters alone do not guarantee better performance.[3]

### Parameter vs. hyperparameter

These are frequently confused.

| Item           | Learned during training? | Set by developer/training process? | Examples                                                            |
| -------------- | -----------------------: | ---------------------------------: | ------------------------------------------------------------------- |
| Parameter      |                      Yes |                       Not directly | Weights, biases                                                     |
| Hyperparameter |                       No |                                Yes | Learning rate, batch size, number of layers, epochs, context length |

```text
Parameters:
The model learns them.

Hyperparameters:
Humans or automated tuning set them before/during training.
```

For an LLM, the number of attention heads, context length, learning rate, batch size, and number of training iterations are examples of hyperparameters.[1][3]

## Training

**Training** is the process in which a model examines data, makes predictions, measures how wrong it is according to a loss/objective function, and updates parameters to improve.[1]

```text
1. Start with initial weights
2. Feed training data into the model
3. Produce an output/prediction
4. Measure error with a loss function
5. Adjust weights to reduce loss
6. Repeat over many batches/epochs
```

```text
Training example:
Input: “Claim your prize now”
Known label: Spam

Model prediction: Not spam
        |
        v
Loss measures the mismatch
        |
        v
Optimizer adjusts weights
        |
        v
Future predictions become more accurate
```

In gradient-based deep learning, the process usually involves:

```text
Forward pass
  → model calculates output

Loss calculation
  → measures prediction error

Backward pass / backpropagation
  → calculates how parameters contributed to error

Optimizer step
  → slightly adjusts parameters
```

A broad mathematical form is:

$$
\theta \leftarrow \theta - \eta \nabla_{\theta}L(\theta)
$$

where:

- $\theta$ represents model parameters.
- $L(\theta)$ is the loss function.
- $\nabla_{\theta}L(\theta)$ is the gradient of loss with respect to the parameters.
- $\eta$ is the learning rate, a hyperparameter.

### Training is not inference

Training updates weights. Inference normally keeps them fixed.

```text
Training:
Data → model → error → update weights

Inference:
New input → trained model → output
```

For LLM pretraining, a common objective is to predict the next token. If the input is:

```text
“The capital of France is”
```

the target may be:

```text
“Paris”
```

The model’s parameters are updated whenever its predicted probability distribution differs from the desired next token.

## Inference

**Inference** is using the trained model on new data to calculate an output—such as a score, class, forecast, recommendation, or generated token sequence.[1][3]

```text
New customer transaction
          |
          v
Trained fraud model
          |
          v
Risk score: 0.92
          |
          v
Application decision:
request additional verification
```

For a chatbot:

```text
Your prompt
   |
   v
Tokenizer converts text to tokens
   |
   v
LLM inference calculates likely next-token probabilities
   |
   v
Decoder selects a token
   |
   v
Repeat until completion
   |
   v
Generated response
```

Inference is sometimes called:

- Serving.
- Model execution.
- Prediction time.
- Runtime.
- Deployment-time model use.

Unlike training, inference usually does not change the model’s weights.

### Why inference cost matters

Inference can be a major operational cost because every user request requires computation. For generative models, cost and latency tend to rise with:

- Input/context length.
- Number of output tokens generated.
- Model size/parameter count.
- Number of simultaneous requests.
- Model architecture and hardware.
- Whether retrieval, tools, safety filters, or multiple model calls are involved.

## Tokens

A **token** is the unit a model processes. In language models, a token is often a word, part of a word, punctuation mark, or whitespace-associated fragment—not necessarily a whole human-language word.[3]

```text
Text:
“React is powerful!”

Possible conceptual token split:
["React", " is", " powerful", "!"]
```

The exact split varies by model/tokenizer. The same text can produce different token counts with different models.

A practical rule of thumb from the U.S. Department of Defense’s AI lexicon is:

```text
100 English tokens ≈ 75 English words
```

This is only an approximation. Code, numbers, non-English languages, URLs, rare words, punctuation, and unusual formatting can use substantially different token counts.[3]

### Tokens in an LLM

```text
Prompt text
    |
    v
Tokenizer
    |
    v
Token IDs: [15496, 374, 8147, 0]
    |
    v
Embeddings / numeric vectors
    |
    v
Transformer layers
    |
    v
Probability distribution over next token
    |
    v
Selected next token
```

An autoregressive LLM repeatedly predicts the next token based on previous tokens.[1]

```text
Input: “The capital of France is”
Model predicts: “ Paris”
New context: “The capital of France is Paris”
Model predicts: “.”
```

This repeats until the model reaches a stopping condition or output-token limit.

### Input, output, and context tokens

| Token type     | Meaning                                            | Example                                                               |
| -------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| Input tokens   | Tokens in the prompt sent to the model             | System instructions + your question + pasted document                 |
| Output tokens  | Tokens generated by the model                      | The assistant’s answer                                                |
| Context tokens | Total tokens considered together at once           | Conversation history + prompt + retrieved material + generated output |
| Context window | Maximum context a model can process in one request | The model’s total input/output token capacity                         |

Context length includes both prompt tokens and generated response tokens. Increasing context length allows more information to be considered in a request, but it can increase computation and latency.[3]

## Worked example: an LLM answer

Suppose someone asks:

```text
“Explain React state in one paragraph.”
```

```text
1. Tokenization
   Input text becomes token IDs.

2. Inference
   The model processes those tokens using fixed learned weights.

3. Next-token selection
   It calculates probabilities for possible next tokens.

4. Generation
   It selects one next token, adds it to the context, then repeats.

5. Output
   A sequence of output tokens becomes readable text.
```

During this interaction:

| Thing       | Role                                                 |
| ----------- | ---------------------------------------------------- |
| Prompt text | Input data                                           |
| Tokens      | Pieces of the prompt/output that the model processes |
| Model       | Transformer architecture plus learned parameters     |
| Weights     | Learned numeric values used for calculations         |
| Inference   | Running the model to generate the answer             |
| Training    | Earlier process that learned those weights           |

## Common misconceptions

### “Parameters are the training data”

No. Training data is the set of examples used to learn. Parameters are the numeric values the model learns from that training process.

```text
Training data: books, images, code, labels, sensor records
Parameters: learned numeric values inside the model
```

A model may memorize some training examples, but its parameters are not simply a readable database of the original records.

### “Weights and parameters are exactly the same”

In everyday neural-network discussion, people often use them interchangeably. Technically, **weights are one type of parameter**; biases are another common type.[1][3]

### “Inference means reasoning”

Not necessarily. In ML engineering, inference means running a trained model to produce an output. It can be as simple as calculating a fraud score or image label; it does not imply human-like reasoning.[3]

### “More parameters always means a better model”

Not necessarily. Model performance also depends on data quality, architecture, training method, compute, task fit, fine-tuning, retrieval, evaluation, and safety controls. Larger models also cost more to train and run.[3]

### “One token equals one word”

No. Tokens are tokenizer-defined units, commonly word pieces, punctuation, or whitespace fragments.[3]

## Interview answer

> A model is the architecture plus learned parameters used to map inputs to outputs. Parameters are internal values learned during training; in neural networks, they include weights and biases. A weight is a parameter that controls the strength of a connection or feature’s influence. Training is the optimization process that repeatedly compares model outputs with a target or objective and updates parameters to reduce loss. Inference is running the trained, normally fixed model on new input to produce a prediction, classification, recommendation, or generated response. In LLMs, text is broken into tokens—usually word pieces rather than complete words—and the model generates output by repeatedly predicting the next token.[1][3]

## Sources

[1] Machine Learning Glossary - Google for Developers https://developers.google.com/machine-learning/glossary
[2] Glossary of Terms | National Telecommunications and Information ... https://www.ntia.gov/issues/artificial-intelligence/ai-accountability-policy-report/glossary-of-terms
[3] Lexicon - Chief Digital and Artificial Intelligence Office https://www.ai.mil/Lexicon/
[4] https://en.wikipedia.org/wiki/SOLID
[5] [PDF] Adversarial Machine Learning: A Taxonomy and Terminology of ... https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2023.pdf
[6] [PDF] Adversarial Machine Learning - NIST Technical Series Publications https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf
[7] The Language of Trustworthy AI: An In-Depth Glossary of Terms - NIST https://www.nist.gov/publications/language-trustworthy-ai-depth-glossary-terms
[8] Understanding Tokens and Parameters in Model Training: A Deep ... https://www.functionize.com/blog/understanding-tokens-and-parameters-in-model-training
[9] AI Glossary: The definitive guide to essential terms in artificial ... https://www.entefy.com/blog/ai-glossary-the-definitive-guide-to-essential-terms-in-artificial-intelligence/
[10] AI Glossary 2026: Essential Terms & Definitions Guide | TJS https://techjacksolutions.com/ai-glossary/
