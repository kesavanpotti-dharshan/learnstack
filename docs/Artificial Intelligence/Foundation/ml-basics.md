---
title: ML Basics
sidebar_label: ML Basics
sidebar_position: 5
---

Machine learning is about learning patterns from data and then checking whether those patterns work on **new, unseen data**. The essentials are: choose the learning type, split data into train/validation/test sets, avoid overfitting, and measure success with metrics that match the real business goal.[1][2]

## Learning types

### Supervised learning

**Supervised learning** uses examples with known answers, called labels or targets.

```text
Input data + correct answer
        ↓
Model learns the relationship
        ↓
New input → predicted answer
```

Examples:

| Problem                | Input               | Label / target      | Model output     |
| ---------------------- | ------------------- | ------------------- | ---------------- |
| Spam detection         | Email text          | Spam or not spam    | Spam probability |
| Fraud detection        | Transaction details | Fraud or legitimate | Fraud-risk score |
| House-price prediction | Home features       | Sale price          | Estimated price  |
| Customer churn         | Account activity    | Churned or stayed   | Churn likelihood |

The two common supervised tasks are:

- **Classification:** Predict a category, such as fraud/not fraud or cat/dog/bird.
- **Regression:** Predict a numeric value, such as demand, temperature, delivery time, or price.

Use supervised learning when you have reliable historical outcomes and a clear question to predict.

### Unsupervised learning

**Unsupervised learning** uses data without a target label. Instead of predicting a known answer, it looks for structure, similarity, groups, or unusual data points.[3][4]

```text
Unlabeled data
      ↓
Model identifies patterns
      ↓
Clusters, similarities, compressed representations, or anomalies
```

Examples:

| Use case                 | What the model looks for                                |
| ------------------------ | ------------------------------------------------------- |
| Customer segmentation    | Groups with similar purchasing behavior                 |
| Product grouping         | Products that are similar based on features or behavior |
| Anomaly detection        | Unusual transactions, devices, or events                |
| Document clustering      | Articles or support tickets with related themes         |
| Dimensionality reduction | A simpler representation of complex data                |

Example:

```text
Customer A: frequent, low-value grocery purchases
Customer B: frequent, low-value grocery purchases
Customer C: rare, high-value electronics purchases
Customer D: rare, high-value electronics purchases
```

An unsupervised model may discover two clusters without anyone first defining labels such as “grocery-focused” and “high-value electronics.”

### Supervised vs. unsupervised

| Question                                    | Supervised learning             | Unsupervised learning                                           |
| ------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| Does training data contain correct answers? | Yes                             | No                                                              |
| Main goal                                   | Predict known targets           | Discover hidden structure                                       |
| Common output                               | Class, score, forecast, number  | Cluster, anomaly score, embedding                               |
| Example                                     | “Will this customer churn?”     | “What customer groups exist?”                                   |
| Evaluation                                  | Compare predictions with labels | Evaluate usefulness, stability, separation, or downstream value |

## Train, validation, and test

A model should not be judged only on the data it studied. Split the data into separate sets so you can assess whether it generalizes to unfamiliar examples. Google recommends distinct training, validation, and test subsets, with validation used during development and test reserved for final evaluation.[2]

```text
Original dataset
      ↓
┌───────────────────────────────────────────────────────┐
│ Training set  │ Validation set │ Test set              │
│ Learn         │ Tune          │ Final unbiased check   │
└───────────────────────────────────────────────────────┘
```

### Training set

The **training set** is the data the model learns from.

```text
Training examples
    ↓
Model makes predictions
    ↓
Compare to known labels
    ↓
Adjust model parameters
    ↓
Repeat
```

This set is typically the largest portion because the model needs many examples to learn useful patterns.

### Validation set

The **validation set** is held out from training and used while developing the model.

Use it to compare choices such as:

- Which algorithm/model family works best.
- Number of trees, layers, or features.
- Learning rate, regularization, batch size, or training duration.
- Decision threshold for classifying a case as positive.
- Whether a new feature improves the model.
- When to stop training before overfitting increases.

```text
Train model on training set
          ↓
Check performance on validation set
          ↓
Tune model/design choices
          ↓
Repeat development cycle
```

The validation set is not fully “untouched,” because the team uses it to make decisions. Repeatedly optimizing against it can cause validation overfitting.

### Test set

The **test set** is the final, protected evaluation set.

```text
Build and tune with:
Training + validation data
          ↓
Freeze final approach
          ↓
Evaluate once on test data
          ↓
Report realistic expected performance
```

It should not influence model selection, feature selection, threshold tuning, or repeated experimentation. A test set is intended to estimate performance on new, production-like data.[2]

### A simple analogy

```text
Training set   = course material and practice exercises
Validation set = mock exams used to refine study strategy
Test set       = final exam, kept unseen until the end
```

If you memorize the final exam questions while studying, the score no longer measures real understanding. The same is true when teams repeatedly tune a model based on the test set.

### Typical split

There is no universal split. A common starting point is:

```text
70–80% training
10–15% validation
10–20% test
```

The appropriate split depends on total data size, class balance, data freshness, and the risk of mistakes. With limited data, use cross-validation so different folds rotate through validation roles. With very large datasets, a smaller percentage can still yield enough validation and test examples.[2][5]

### Data leakage

**Data leakage** happens when information from the future, test set, validation set, or target label improperly reaches the training process.

```text
Example:
Predict whether a customer will churn next month.

Leakage feature:
“Account closed date”
```

That field may only exist after churn has occurred, so the model appears highly accurate during testing but fails in production.

Other leakage examples:

- The same customer appearing in both training and test data when that makes records overly similar.
- Duplicate documents across sets.
- Normalizing/scaling data using statistics computed from the entire dataset before splitting.
- Using future transaction information to predict a past outcome.
- Selecting features after inspecting test-set performance.

A sound validation/test set should be representative of production data and contain no duplicates from training data.[2]

## Overfitting and underfitting

### Overfitting

**Overfitting** occurs when a model learns the quirks, noise, or accidental details of training data so closely that it performs well in training but poorly on unseen data.[1]

```text
Training performance: excellent
Validation/test performance: weak
                    ↓
Likely overfitting
```

```text
Model has memorized practice questions
instead of learning the underlying subject.
```

Common causes include an overly complex model, too little or unrepresentative training data, data leakage, noisy labels, excessive training, or repeatedly tuning to the validation set.[1]

### Underfitting

**Underfitting** means the model is too simple, insufficiently trained, uses weak features, or cannot capture the relevant pattern.

```text
Training performance: poor
Validation/test performance: poor
                    ↓
Likely underfitting
```

```text
Model has not learned enough even from its training material.
```

### Good fit / generalization

A useful model performs similarly on training, validation, and test data, with some expected gap.

```text
Training performance: good
Validation performance: similarly good
Test performance: similarly good
                    ↓
Likely good generalization
```

**Generalization** is the ability to perform well on new data that resembles the real-world cases the system will encounter. Google describes it as the opposite of overfitting.[1]

| Pattern                | Training performance | Validation/test performance   | Interpretation                           |
| ---------------------- | -------------------- | ----------------------------- | ---------------------------------------- |
| Underfitting           | Poor                 | Poor                          | Model has not learned useful patterns    |
| Good generalization    | Good                 | Similar and good              | Model likely transfers to new data       |
| Overfitting            | Very high            | Clearly worse                 | Model learned training-specific noise    |
| Data leakage suspicion | Extremely high       | Surprisingly high or unstable | Verify data split and features carefully |

### Reducing overfitting

- Collect more representative training data.
- Improve label quality.
- Use a simpler model or reduce unnecessary features.
- Use regularization techniques.
- Stop training when validation performance worsens.
- Use cross-validation when data is limited.
- Prevent leakage and duplicates across partitions.
- Keep validation and test data representative of production.
- Monitor production performance for drift.

More data does not automatically solve every problem; it must be relevant, representative, and correctly labeled.

## Metrics: how model performance is measured

A **metric** is a number that describes how well a model performs. Choose metrics based on the problem type and the cost of errors—not only on what is easiest to calculate.

```text
Business goal
      ↓
Failure costs and constraints
      ↓
Appropriate model metric(s)
      ↓
Threshold / deployment decision
```

For instance, a fraud model and a movie-recommendation model should not be evaluated exactly the same way.

### Classification metrics

Classification predicts categories, such as “fraud” versus “not fraud.”

First, understand the four possible outcomes:

| Actual case | Model prediction | Name           |
| ----------- | ---------------- | -------------- |
| Fraud       | Fraud            | True positive  |
| Legitimate  | Legitimate       | True negative  |
| Legitimate  | Fraud            | False positive |
| Fraud       | Legitimate       | False negative |

### Accuracy

**Accuracy** is the proportion of all predictions that are correct.

```text
Correct predictions / all predictions
```

Accuracy is easy to understand but can be misleading for imbalanced data.

Example:

```text
1,000 transactions:
990 legitimate
10 fraudulent

A model that predicts “legitimate” every time:
Accuracy = 99%

But it detects zero fraud.
```

For rare-event problems such as fraud, disease detection, or security alerts, accuracy alone is usually inadequate.

### Precision

**Precision** answers:

> Of the cases the model predicted as positive, how many were actually positive?

Example:

```text
Model flags 100 transactions as fraud.
80 are actually fraud.

Precision is high because most alerts are valid.
```

High precision matters when false alarms are expensive or disruptive:

- Blocking legitimate payments.
- Sending scarce investigators to false leads.
- Waking an on-call engineer for a non-issue.
- Showing users incorrect medical or legal warnings.

### Recall

**Recall**, also called sensitivity, answers:

> Of all truly positive cases, how many did the model find?

Example:

```text
There are 100 actual fraud cases.
Model identifies 85.

Recall is high because it caught most fraud.
```

High recall matters when missing a positive case is dangerous or costly:

- Detecting fraud.
- Finding serious safety defects.
- Screening for a disease.
- Detecting security incidents.

### Precision-recall trade-off

Often, increasing recall causes more false positives and lower precision; increasing precision can miss more true positives and lower recall.

```text
Lower threshold:
More cases flagged
→ Higher recall
→ Usually lower precision

Higher threshold:
Fewer cases flagged
→ Usually higher precision
→ Lower recall
```

The correct trade-off depends on business cost and risk.

```text
Fraud investigation:
False negative may cost money.
False positive may inconvenience a customer.

Cancer screening:
Missing a serious case may be far costlier than a follow-up test.

Email spam:
Incorrectly hiding a legitimate email may be unacceptable.
```

### F1 score

**F1 score** combines precision and recall into one summary measure. It is useful when you need a single balance-oriented score, particularly when classes are imbalanced.

Do not rely on F1 alone if the business costs of false positives and false negatives differ sharply. In that case, review precision, recall, threshold behavior, and cost directly.

### ROC-AUC and PR-AUC

These metrics evaluate how well a model separates positive from negative cases across many possible thresholds.

| Metric  | Best interpretation/use                                                                         |
| ------- | ----------------------------------------------------------------------------------------------- |
| ROC-AUC | Overall ranking/separation ability across thresholds; useful as a broad comparison              |
| PR-AUC  | Often more informative when positive cases are rare, such as fraud or critical defect detection |

Neither metric tells you the exact operational false-positive/false-negative rate at your chosen deployment threshold. Always inspect threshold-specific outcomes too.

### Regression metrics

Regression predicts a number, such as sales, demand, price, delivery time, or energy usage.

| Metric    | Plain meaning                                                                | Useful when                                                    |
| --------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| MAE       | Average size of the prediction error                                         | You want an easy-to-explain average error in the original unit |
| MSE       | Average squared error, which penalizes large mistakes more heavily           | Large errors are especially costly                             |
| RMSE      | Error magnitude in the original target unit, while emphasizing larger errors | You want an interpretable measure sensitive to big misses      |
| R-squared | How much variation is explained relative to a simple baseline                | Comparing fit, with care and context                           |
| MAPE      | Average percentage error                                                     | Target values are positive and percentage error is meaningful  |

Example:

```text
Demand forecast:
Actual sales: 100 units
Predicted sales: 112 units

Absolute error: 12 units
```

For a supply chain team, “average error of 12 units” may be more actionable than an abstract score.

### Ranking and recommendation metrics

For search and recommendation systems, the question is often not just “Was the label correct?” but “Did the best items appear near the top?”

Common metrics include:

- **Precision at K:** How many of the top K shown items were relevant.
- **Recall at K:** How many relevant items appeared in the top K.
- **NDCG:** Rewards placing highly relevant items near the top.
- **Click-through rate, conversion rate, or watch time:** Online business metrics, used carefully because they can be affected by UI, position bias, and feedback loops.

### Generative-AI evaluation

For text-generation systems, automatic scores are often insufficient. Evaluate along several dimensions:

- Factual accuracy and grounding.
- Relevance to the user’s request.
- Completeness.
- Citation correctness, when sources are required.
- Format and structured-output validity.
- Safety and policy compliance.
- Hallucination rate.
- Latency and cost.
- Human preference or task-success rate.

For high-impact uses, evaluate with representative test cases, red-team scenarios, validation rules, and human review rather than relying on a single “accuracy” score.

## Practical workflow

```text
1. Define the decision or user outcome.
2. Identify the target, if using supervised learning.
3. Collect representative data and check label quality.
4. Split data before preprocessing/model development.
5. Train candidate models using the training set.
6. Tune choices using validation data or cross-validation.
7. Select and freeze the final approach.
8. Evaluate once on the protected test set.
9. Review metrics by important subgroups and error types.
10. Deploy with monitoring for data drift, performance drift, and real-world outcomes.
```

## Key takeaways

- **Supervised learning** predicts known labels or numbers; **unsupervised learning** discovers structure in unlabeled data.
- The **training set** teaches the model, the **validation set** helps tune it, and the **test set** provides the final independent performance estimate.[2]
- **Overfitting** means strong training performance but weak unseen-data performance; **generalization** means the model works on realistic new data.[1]
- Use metrics that reflect actual error costs. Accuracy is often not enough, especially for rare events.
- Always check for leakage, duplicates, unrepresentative splits, and production data drift.
- A model’s offline metric is not the same as business success; validate both before and after deployment.

## Sources

[1] Overfitting | Machine Learning - Google for Developers https://developers.google.com/machine-learning/crash-course/overfitting/overfitting
[2] Dividing the original dataset | Machine Learning https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets
[3] Supervised vs. Unsupervised Learning: What's the Difference? - IBM https://www.ibm.com/think/topics/supervised-vs-unsupervised-learning
[4] Types of Machine Learning | IBM https://www.ibm.com/think/topics/machine-learning-types
[5] The Differences Between Training, Validation & Test Datasets https://kili-technology.com/blog/training-validation-and-test-sets-how-to-split-machine-learning-data
[6] What is the Difference Between Test and Validation Datasets? https://www.machinelearningmastery.com/difference-test-validation-datasets/
[7] A Commentary on Google's Machine Learning Crash Course https://faun.pub/a-commentary-on-googles-machine-learning-crash-course-1ac7e2baf058
[8] Is this considered as overfitting? : r/learnmachinelearning - Reddit https://www.reddit.com/r/learnmachinelearning/comments/1axgmrn/is_this_considered_as_overfitting/
