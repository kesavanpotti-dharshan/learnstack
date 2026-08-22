---
title: Types of Learning
sidebar_label: Types of Learning
sidebar_position: 2
---

Machine-learning “types of learning” differ mainly in the **feedback signal** available during training: correct labels, no labels, rewards from actions, or labels created from the data itself. Supervised learning learns input-to-output predictions; unsupervised learning discovers structure; reinforcement learning learns actions from rewards; and self-supervised learning creates its own training targets from unlabeled data.[1][2][3][4]

## At a glance

| Type                     | Training signal                    | Primary goal                   | Typical output                                          | Example                |
| ------------------------ | ---------------------------------- | ------------------------------ | ------------------------------------------------------- | ---------------------- |
| Supervised learning      | Human- or system-provided labels   | Predict a known target         | Class, probability, number                              | Spam / not spam        |
| Unsupervised learning    | No target labels                   | Find hidden structure          | Clusters, embeddings, anomalies                         | Customer segments      |
| Reinforcement learning   | Rewards or penalties after actions | Learn a decision-making policy | Action or action sequence                               | Robot navigation       |
| Self-supervised learning | Targets derived from input data    | Learn useful representations   | Pretrained model/embeddings; sometimes generated tokens | Predict a missing word |

[1][2][3][4]

```text
Question: What feedback does the model receive?

Correct answer for each example?
   → Supervised learning

No answer; find structure?
   → Unsupervised learning

Reward after taking action in an environment?
   → Reinforcement learning

Answer manufactured from the input itself?
   → Self-supervised learning
```

## Supervised learning

**Supervised learning** trains a model using labeled examples: each input \(x\) is paired with a correct output \(y\). The model learns a mapping from input to target, then applies it to new unseen data.[1][2]

```text
Training data

Email text                              Label
-------------------------------------   ----------
"Claim your prize now!"                 Spam
"Meeting moved to 2 PM"                 Not spam
"Limited offer—act today"               Spam
```

```text
Input features + known label
            |
            v
Model training
            |
            v
Trained predictor
            |
            v
New input → predicted label/value
```

Mathematically, supervised learning often learns:

$$
f(x) \approx y
$$

### Main supervised tasks

| Task                       | Target type         | Example                 |
| -------------------------- | ------------------- | ----------------------- |
| Classification             | Category or class   | Fraud vs. non-fraud     |
| Binary classification      | One of two classes  | Approved vs. rejected   |
| Multi-class classification | One of many classes | Cat, dog, bird, or fish |
| Regression                 | Continuous number   | Predicted home price    |
| Ranking                    | Ordered relevance   | Search-result ordering  |

### Example: house-price prediction

```text
Input:
Square footage, bedrooms, location, age, nearby schools

Known training target:
Actual sale price

Model prediction:
Estimated sale price for a new home
```

Use supervised learning when you have reliable historical outcomes and a clear prediction target.

**Strengths**

- Straightforward to evaluate with held-out labels.
- Often strong for classification, scoring, forecasting, and ranking.
- Well suited to business problems with historical decisions or outcomes.

**Limitations**

- High-quality labels can be expensive and slow to collect.
- Labels may embed past human bias or measurement errors.
- A model can perform poorly if real-world data shifts away from its training data.

## Unsupervised learning

**Unsupervised learning** uses unlabeled data. There is no correct output supplied for each example, so the model looks for patterns, similarities, groups, lower-dimensional structure, or unusual observations on its own.[2][4]

```text
Customer data, without labels

Customer   Purchases/month   Average spend   Categories
--------   ---------------   -------------   ----------
A          20                $18             Groceries
B          18                $22             Groceries
C          1                 $1,500          Electronics
D          2                 $1,200          Electronics
```

A clustering algorithm may discover:

```text
Cluster 1 → frequent, lower-value grocery shoppers
Cluster 2 → infrequent, high-value electronics shoppers
```

No one explicitly provided labels such as “grocery shopper” or “electronics shopper.”

### Common unsupervised tasks

| Task                     | Purpose                                                 | Common examples                           |
| ------------------------ | ------------------------------------------------------- | ----------------------------------------- |
| Clustering               | Group similar observations                              | Customer segmentation, document grouping  |
| Dimensionality reduction | Compress/simplify data while retaining useful structure | Visualization, feature compression        |
| Association rules        | Find items/events that occur together                   | Market-basket analysis                    |
| Anomaly detection        | Find unusual observations                               | Suspicious transactions, equipment faults |
| Representation learning  | Create useful numeric representations                   | Search and similarity systems             |

Common methods include k-means clustering, Gaussian mixture models, principal component analysis (PCA), and association-rule algorithms.[4]

### Important boundary

Unsupervised learning does not usually answer a pre-defined target question like “Will this customer churn?” Instead, it helps discover questions or structure:

```text
Supervised:
“Which customers will churn?”

Unsupervised:
“Are there distinct groups of customers, and what characterizes them?”
```

**Strengths**

- Uses abundant unlabeled data.
- Helpful for exploration, segmentation, visualization, feature engineering, and anomaly discovery.
- Can reveal patterns not anticipated by the team.

**Limitations**

- Results may be harder to evaluate objectively.
- Clusters are not automatically meaningful business segments.
- You often need domain expertise to interpret the discovered structure.

## Reinforcement learning

**Reinforcement learning (RL)** trains an **agent** to choose actions in an environment. Instead of receiving a correct answer for every example, the agent receives rewards or penalties based on consequences of its actions and learns a policy that maximizes cumulative reward over time.[4][5]

```text
Agent observes current state
           |
           v
Agent chooses action
           |
           v
Environment changes
           |
           v
Agent receives reward / penalty
           |
           v
Agent improves its policy
```

A standard RL loop is:

​`text
s_t -> a_t -> r_t -> s_{t+1}
​`

where:

- `s_t` is the state at time `t`
- `a_t` is the selected action
- `r_t` is the reward
- `s_{t+1}` is the next state

### Example: robot navigation

```text
State:
Robot location, obstacle positions, destination direction

Actions:
Move forward, turn left, turn right, stop

Rewards:
+100 for reaching destination
-100 for collision
-1 for each time step
```

The agent learns not merely one action, but a **policy**: a rule for selecting actions in different states.

### Common RL applications

- Game-playing systems.
- Robotics and motion control.
- Data-center or energy optimization.
- Bidding and resource-allocation simulations.
- Recommendation or ranking policies, when safe and carefully designed.
- Fine-tuning language models using preference/reward signals.

### Why RL is different

```text
Supervised learning:
Input → known correct label

Reinforcement learning:
State → action → delayed reward
```

An action can have delayed effects. For example, a poor move now may cause failure later, so the learning problem includes **credit assignment**: determining which past actions deserve credit or blame.

**Strengths**

- Suited to sequential decisions and long-term objectives.
- Can discover strategies that are not present as labeled examples.
- Useful when an agent can safely learn in simulation or constrained environments.

**Limitations**

- Reward design is difficult; agents may exploit an imperfect reward function.
- Trial-and-error can be expensive or unsafe in real environments.
- Requires careful simulation, safety controls, evaluation, and monitoring.
- Learning can be unstable and data-intensive.

### RL versus RLHF

**Reinforcement Learning from Human Feedback (RLHF)** is a specific approach, often used with language models. Humans compare or rate model outputs; a reward model learns those preferences; then RL is used to optimize the model toward higher predicted human preference. RLHF is not synonymous with all reinforcement learning.[4]

## Self-supervised learning

**Self-supervised learning (SSL)** trains on unlabeled data but derives the training target from the data itself. It is usually considered a form of unsupervised learning because it does not require human-provided labels, while its training objective often resembles supervised learning because it predicts a known target.[1][3]

```text
Unlabeled original text:
"The capital of France is Paris."

Create a task from the same data:
"The capital of France is [MASK]."

Target automatically derived from source:
"Paris"
```

No human needed to annotate “the correct masked word is Paris.” The original data supplies the target.

### How self-supervision works

```text
Raw unlabeled data
      |
      v
Create an artificial prediction task
      |
      v
Input + target derived from the same data
      |
      v
Train model to predict the target
      |
      v
Learn reusable representations / pretrained model
```

Common self-supervised tasks include:

| Data type    | Pretext task                                | Example                                |
| ------------ | ------------------------------------------- | -------------------------------------- |
| Text         | Predict missing or next token               | “React uses \_\_\_ for local memory”   |
| Image        | Reconstruct masked image patches            | Recover hidden portion of an image     |
| Audio        | Predict masked audio segments               | Reconstruct missing speech features    |
| Video        | Predict missing frames or temporal ordering | Learn motion structure                 |
| General data | Contrast related vs. unrelated views        | Learn which examples should be similar |

IBM describes self-supervised learning as generating implicit labels from unstructured data and commonly using a pretext task followed by a downstream task.[3]

### Example: language-model pretraining

A language model may train on a sentence like:

```text
"React components return JSX."
```

For next-token prediction:

```text
Input:  "React components return"
Target: "JSX"
```

Across enormous text corpora, the model learns representations of grammar, vocabulary, concepts, patterns, and relationships. It can then be adapted to downstream tasks such as classification, retrieval, summarization, or generation.

```text
Self-supervised pretraining
        |
        v
General-purpose learned representation
        |
        +--> Fine-tune for sentiment classification
        +--> Fine-tune for document retrieval
        +--> Prompt for text generation
        +--> Adapt for a domain-specific task
```

### Why SSL matters

Human labeling is expensive. The internet, corporate repositories, sensor streams, images, and logs contain large amounts of unlabeled data. SSL uses this data to train large models before applying smaller labeled datasets or task-specific fine-tuning.

This is central to many modern foundation models and large language models.

**Strengths**

- Uses large amounts of unlabeled data.
- Reduces dependence on costly manual labels.
- Produces reusable pretrained representations.
- Works well for text, images, audio, video, and multimodal data.

**Limitations**

- Large-scale pretraining can require major compute, data curation, and engineering resources.
- The model can learn biases, errors, and sensitive patterns found in source data.
- Good pretraining performance does not guarantee safe or accurate behavior in a downstream application.

## Key boundaries

### Supervised vs. self-supervised

```text
Supervised:
A human or external process provides the target label.

Self-supervised:
The target is automatically constructed from the input data.
```

Example:

```text
Supervised image task:
Photo → “Golden retriever” label supplied by annotator

Self-supervised image task:
Masked photo → predict its hidden image patch
```

Both optimize against a target, but only supervised learning needs externally provided labels.[1][3]

### Unsupervised vs. self-supervised

```text
Unsupervised:
Find structure with no explicit prediction target.
Examples: clustering, PCA.

Self-supervised:
Create a target from the data, then solve a prediction task.
Examples: next-token prediction, masked-image reconstruction.
```

Self-supervised learning is often grouped under unsupervised learning because it uses unlabeled data, but it is distinct enough in practice to discuss separately.[3][4]

### Supervised vs. reinforcement learning

```text
Supervised:
Every example includes a target answer.

Reinforcement:
The agent gets feedback after action consequences, often delayed.
```

A self-driving simulation illustrates the difference:

```text
Supervised:
Training record says the correct steering angle for each image.

Reinforcement:
Vehicle chooses steering actions; reward depends on safety,
progress, lane position, and eventually reaching the destination.
```

### Reinforcement learning vs. self-supervised learning

```text
Reinforcement learning:
Learns what to do through action consequences and rewards.

Self-supervised learning:
Learns representations by predicting parts/transformations of data.
```

They can be combined. For example, a large language model may first be pretrained with self-supervised next-token prediction, then refined using human preference data and an RL-based method.

## Practical selection guide

| Problem                                                                      | Usually start with                                                    | Why                                       |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| Predict fraud, demand, churn, price, diagnosis, or defect                    | Supervised learning                                                   | Historical labeled outcomes exist         |
| Segment customers or explore unknown data structure                          | Unsupervised learning                                                 | No target label; discovery is the goal    |
| Learn game play, robot movement, or a sequential control policy              | Reinforcement learning                                                | Actions change future states and rewards  |
| Pretrain a language, image, audio, or multimodal model from massive raw data | Self-supervised learning                                              | Raw data provides its own training signal |
| Small labeled set plus large unlabeled set                                   | Semi-supervised learning or self-supervised pretraining + fine-tuning | Reduces labeling requirement              |

Semi-supervised learning is a related fifth category: it uses a small labeled dataset together with a larger unlabeled dataset.[4][5]

## Interview answer

> Supervised learning trains on labeled input-output examples to predict a known target, such as spam classification or sales forecasting. Unsupervised learning uses unlabeled data to discover structure, such as customer clusters or anomalies. Reinforcement learning trains an agent through interaction: the agent chooses actions, observes consequences, and learns a policy that maximizes cumulative reward. Self-supervised learning also uses unlabeled data, but creates its own targets from the data—such as predicting the next word or a masked image region—so it can pretrain powerful representations. The key distinction is the source of the learning signal: labels for supervised learning, no target labels for unsupervised learning, reward feedback for RL, and data-derived targets for self-supervised learning.[1][2][3][4]

## Sources

[1] What Is Supervised Learning? | IBM https://www.ibm.com/think/topics/supervised-learning
[2] Supervised vs. Unsupervised Learning: What's the Difference? - IBM https://www.ibm.com/think/topics/supervised-vs-unsupervised-learning
[3] What Is Self-Supervised Learning? - IBM https://www.ibm.com/think/topics/self-supervised-learning
[4] Types of Machine Learning | IBM https://www.ibm.com/think/topics/machine-learning-types
[5] NVIDIA Blog: Supervised Vs. Unsupervised Learning https://blogs.nvidia.com/blog/supervised-unsupervised-learning/
[6] Machine learning 101: The types of ML explained - Data Science Dojo https://datasciencedojo.com/blog/machine-learning-101/
[7] Machine Learning Types: Supervised, Unsupervised, Semi ... https://www.linkedin.com/posts/buddhadeb-bhattacharya-005768299_types-of-machine-learning-explained-supervised-activity-7419366538090246144-v5IG
