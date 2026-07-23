---
title: Frobenius Norm and some Linear Algebra Exercises
subtitle: >-
  An introduction to the Frobenius norm through 6 Linear Algebra exercises (3 easy, 2 medium, 1 hard) covering scaling, transpose invariance, the triangle inequality, and the trace identity for orthogonal matrices — solved with NumPy and TensorFlow.
author:
  name: Victor Gabriel Lucio
metadata:
  readTime: 10 minutes
  status: finished
  edited: '2026-07-23 12:07'
---

## Frobenius Norm
$$
\| A \|_{\mathrm{F}} = \sqrt{\sum_{i=1}^{m} \sum_{j=1}^{n} |a_{ij}|^2}
\\[0.5cm]
\text{Frobenius norm is the square root of the sum of the absolute squares of each element.}
$$

## Easy questions
### E1. Compute $‖A‖_F$ for $A = [[3, 4], [0, 0]]$, then compute the $L_2$ norm of the vector $[3,4]$.

```python
A = tf.Variable([[3, 4], [0, 0]], dtype=tf.dtypes.float32)

# Numpy way
fn_np = np.linalg.norm(
    A,
    ord="fro"
)

# Pythonic way
fn_p = sum(abs(x)**2 for row in A for x in row)**0.5

# Tensorflow way
fn = tf.norm(
    A, 
    ord="fro",
    axis=[-2, -1],
)

print(f"{fn_np=}")
print(f"{fn_p=}")
print(f"{fn=}")

ltwo = tf.norm(
    A, 
    ord="euclidean",
)
print(f"{ltwo=}")
```

```text
fn_np=np.float32(5.0)
fn_p=<tf.Tensor: shape=(), dtype=float32, numpy=5.0>
fn=<tf.Tensor: shape=(), dtype=float32, numpy=5.0>
ltwo=<tf.Tensor: shape=(), dtype=float32, numpy=5.0>
```

**Result:** $\sqrt{3^2 + 4^2 + 0^2 + 0^2} = \sqrt{25} = 5$

**Relation between $L_2$ and $||A||_f$:** The Frobenius norm of a matrix is equivalent to the L2 norm (Euclidean norm) of the matrix treated as a flattened vector.

### E2. Compute $‖A‖_F$ for $A = [[1, 2], [3, 4]]$. Leave the answer in exact radical form.

```python
A = tf.Variable([[1, 2], [3, 4]], dtype=tf.dtypes.float32)

Af = tf.norm(
    A,
    ord="fro",
    axis=[-2, -1]
)

# Radical form = sqrt(Af^2)
```

### E3. For $A = [[2, 0], [0, 2]]$, compute $‖A‖_F$. Then compute $‖5A‖_F$ without recomputing from scratch — use the scaling property and verify by direct computation.

```python
A = tf.Variable([[2, 0], [0, 2]], dtype=tf.dtypes.float32)

Af = tf.norm(
    A,
    ord="fro",
    axis=[-2, -1]
)

A_5 = tf.multiply(
    A, 5
)

Af_5 = tf.norm(
    A_5,
    ord="fro",
    axis=[-2, -1], 
)

print(f"{Af=}")
# Scalling property
print(f"{5*Af=}")
# Recomputing from scratch
print(f"{A_5=}")
print(f"{Af_5=}")
```

```text
Af=<tf.Tensor: shape=(), dtype=float32, numpy=2.8284270763397217>
5*Af=<tf.Tensor: shape=(), dtype=float32, numpy=14.142135620117188>
A_5=<tf.Tensor: shape=(2, 2), dtype=float32, numpy=
array([[10.,  0.],
       [ 0., 10.]], dtype=float32)>
Af_5=<tf.Tensor: shape=(), dtype=float32, numpy=14.142135620117188>
```

The result is **14.1421** in both cases: multiplying without recomputing from scratch and computing directly give the same result.

## Medium questions
### M1. Given $A = [[1, -2, -3], [4, 0, 1]]$, compute $‖A‖_F$ and $‖Aᵀ‖_F$. Explain from the definition why they must be equal for any matrix.

```python
A = tf.Variable([[1, -2, -3], [4, 0, 1]], dtype=tf.dtypes.float32)

Af = tf.norm(A, ord="fro", axis=[-2, -1])
print(f"{Af=}")

Af_t = tf.norm(tf.transpose(A), ord="fro", axis=[-2,-1])
print(f"{Af_t=}")
```

```text
Af=<tf.Tensor: shape=(), dtype=float32, numpy=5.5677642822265625>
Af_t=<tf.Tensor: shape=(), dtype=float32, numpy=5.5677642822265625>
```

Frobenius norm is the square root of the sum of the absolute squares of each element. Changing the elements' position (transpose) will not change the result.

### M2. Let $A = [[1, 2], [3, 4]]$ and $B = [[0, 1], [1, 0]]$. Compute $‖A‖_F$, $‖B‖_F$ and $‖A + B‖_F$. Verify that the triangle inequality holds and state whether the equality case $‖A + B‖_F = ‖A‖_F + ‖B‖_F$ is possible, and under what condition.

```python
A, B = tf.Variable([[1, 2], [3, 4]], dtype=tf.dtypes.float32), tf.Variable([[0, 1], [1, 0]], dtype=tf.dtypes.float32)
Af = tf.norm(
    A,
    ord="fro",
    axis=[-2, -1],
)

Bf = tf.norm(
    B,
    ord="fro",
    axis=[-2, -1],
)

Abf = tf.norm(
    A + B,
    ord="fro",
    axis=[-2, -1],
)

print(f"{Af=}")
print(f"{Bf=}")
print(f"{Abf=}")
print(f"{Af+Bf=}")
```

```text
Af=<tf.Tensor: shape=(), dtype=float32, numpy=5.4772257804870605>
Bf=<tf.Tensor: shape=(), dtype=float32, numpy=1.4142135381698608>
Abf=<tf.Tensor: shape=(), dtype=float32, numpy=6.480740547180176>
Af+Bf=<tf.Tensor: shape=(), dtype=float32, numpy=6.891439437866211>
```

The Frobenius norm triangle inequality states that for any matrices $A$ and $B$ of the same dimensions, the norm of their sum is less than or equal to the sum of their individual norms.

$$
||A + B||_F \leq ||A||_F + ||B||_F
$$

In our test $||A+B||_F$ was equal to **6.480740547180176** and $||A||_F + ||B||_F$ was equal to **6.891439437866211**. So the triangle inequality holds. On the other side the equality case doesn't hold, because the **equality is possible if and only if one matrix is a nonnegative scalar multiple of the other**, or at least one of the matrices is a **zero matrix**

In this case, neither of the two matrices meets these conditions.

## Hard questions
### H1. Prove that $‖A‖_F² = tr(AᵀA)$ for any real $m×n$ matrix $A$. Then use this identity to prove that $‖QA‖_F = ‖A‖_F$ when $Q$ is orthogonal.

```python
A = tf.Variable([[1, 2, 3], [4, 5, 6]], dtype=tf.dtypes.float32)
Q = tf.Variable([[0, 1], [-1, 0]], dtype=tf.dtypes.float32) # Orthogonal

Af = tf.norm(
    A,
    ord="fro",
    axis=[-2, -1],
)

QAf = tf.norm(
    Q @ A,
    ord="fro",
    axis=[-2, -1],
)

Ata = tf.transpose(A) @ A
trace = tf.linalg.trace(Ata)

print(f"{tf.transpose(A) @ A=}")
print(f"{A * A=}\n")
print(f"{Af=}")
print(f"{Af**2=}")
print(f"{QAf=}")
print(f"{trace=}")
```

```text
tf.transpose(A) @ A=<tf.Tensor: shape=(3, 3), dtype=float32, numpy=
array([[17., 22., 27.],
       [22., 29., 36.],
       [27., 36., 45.]], dtype=float32)>
A * A=<tf.Tensor: shape=(2, 3), dtype=float32, numpy=
array([[ 1.,  4.,  9.],
       [16., 25., 36.]], dtype=float32)>

Af=<tf.Tensor: shape=(), dtype=float32, numpy=9.539392471313477>
Af**2=<tf.Tensor: shape=(), dtype=float32, numpy=91.00000762939453>
QAf=<tf.Tensor: shape=(), dtype=float32, numpy=9.539392471313477>
trace=<tf.Tensor: shape=(), dtype=float32, numpy=91.0>
```


#### **The first question: $||A||^2_F = tr(A^t A)$**
As we said before, the **Frobenius norm** of a matrix is the square root of the sum of the absolute squares of each element. Given by:

$$
||A||_f = \sqrt{\sum_{i=1}^{m} {\sum_{j=1}^{n}}|a_{ij}|^2}
$$

If we square both sides we end up with:
$$
||A||_f^{2} = {\sum_{i=1}^{m} {\sum_{j=1}^{n}}a_{ij}^2}
$$

For $(A^t A)_{jj}$:

$$
{\sum_{i=1}}^{m}(a^t)_{ji} a_{ij}
$$

$(A^t)_{ji}$ is the same as $A_{ij}$

$$
{\sum_{i=1}}^{m}(a^t)_{ji} a_{ij} = {\sum_{i=1}^m a_{ij}a_{ij}} = {\sum_{i=1}^m a_{ij}^2}
$$

**$tr$ is the sum of elements in the main diagonal of a matrix** e.g., ($a_{jj}$).

$$
tr(A^t A) = {\sum_{j=1}^n{\sum_{i=1}^m a_{ij}^2}} = ||A||_f^{2}
$$

This proves:

$$
tr(A^t A) = ||A||_f^{2}
$$

#### **Before the second question: what actually is an orthogonal matrix?**
An orthogonal matrix is a square matrix whose columns are **orthonormal**.

#### **What actually is an orthonormal column?**
These are vectors that are both mutually orthogonal and normalized.
- Orthogonal: Their dot product (inner products) is equal zero.
- Normalized: The length (or norm) of each vector is equal one.

$$
B =
\begin{bmatrix}
  1 & 0 & 0\\
  0 & 0 & 1\\
  0 & 1 & 0
\end{bmatrix}

\\[0.5cm]

1 * 0 * 0 = 0 \text{, Orthogonal} \\
1 + 0 + 0 = 1 \text{, Normalized} \\

\\[0.5cm]
\text{Matrix B is orthogonal and normalized}
$$

#### **Identity**
A square matrix $Q$ satisfying $Q^T Q = Q Q^T = I$, which is equivalent to $Q^{-1} = Q^T$

```python
Q = tf.Variable([[1, 0, 0], [0, 0, 1], [0, 1, 0]], dtype=tf.dtypes.float32)

# Q^T Q = Q Q^T
print(f"{tf.transpose(Q) @ Q = }\n")
print(f"{Q @ tf.transpose(Q) = }\n")

# Q^T = Q^-1
print(f"{tf.transpose(Q) = }\n")
print(f"{tf.linalg.inv(Q) = }\n")
```

```text
tf.transpose(Q) @ Q = <tf.Tensor: shape=(3, 3), dtype=float32, numpy=
array([[1., 0., 0.],
       [0., 1., 0.],
       [0., 0., 1.]], dtype=float32)>

Q @ tf.transpose(Q) = <tf.Tensor: shape=(3, 3), dtype=float32, numpy=
array([[1., 0., 0.],
       [0., 1., 0.],
       [0., 0., 1.]], dtype=float32)>

tf.transpose(Q) = <tf.Tensor: shape=(3, 3), dtype=float32, numpy=
array([[1., 0., 0.],
       [0., 0., 1.],
       [0., 1., 0.]], dtype=float32)>

tf.linalg.inv(Q) = <tf.Tensor: shape=(3, 3), dtype=float32, numpy=
array([[1., 0., 0.],
       [0., 0., 1.],
       [0., 1., 0.]], dtype=float32)>
```

$$
Q^T Q = 
\begin{bmatrix}
  1 & 0 & 0\\
  0 & 0 & 1\\
  0 & 1 & 0
\end{bmatrix}
\begin{bmatrix}
  1 & 0 & 0\\
  0 & 0 & 1\\
  0 & 1 & 0
\end{bmatrix}
=
\begin{bmatrix}
  1 & 0 & 0\\
  0 & 1 & 0\\
  0 & 0 & 1
\end{bmatrix}
=
I 
\\[0.5cm]
Q^{-1} = 
\begin{bmatrix}
  1 & 0 & 0\\
  0 & 0 & 1\\
  0 & 1 & 0
\end{bmatrix}
= Q^T
$$

#### Is there any orthogonal matrix where the elements are not zeros and ones?
Yes, the overwhelming majority of them.

**Examples:**

$$
Q = 
\begin{bmatrix}
  \cos \theta & - \sin \theta \\
  \sin \theta & \cos \theta \\
\end{bmatrix}

\\[0.5cm]

\text{Pick any angle and this is orthogonal. Take }\theta = 45deg \\

\\[0.5cm]

Q =
\begin{bmatrix}
  \frac{\sqrt{2}}{2} & - \frac{\sqrt{2}}{2} \\
  \frac{\sqrt{2}}{2} & \frac{\sqrt{2}}{2} \\
\end{bmatrix}
$$

```python
theta = tf.constant(math.pi / 4) # 45deg
cos = tf.math.cos(theta)
sin = tf.math.sin(theta)

Q = tf.Variable([[cos, -sin], [sin, cos]], dtype=tf.dtypes.float32)

QtQ = tf.transpose(Q) @ Q
QQt = Q @ tf.transpose(Q)

print(f"{QtQ}")
print(f"{QQt}\n")

# Never compare float with ==
print(f"Q^T Q = Q Q^T: {tf.experimental.numpy.allclose(QtQ, QQt)}")
print(f"Q^-1 = Q^T: {tf.experimental.numpy.allclose(tf.linalg.inv(Q), tf.transpose(Q))}")
```

```text
[[0.99999994 0.        ]
 [0.         0.99999994]]
[[0.99999994 0.        ]
 [0.         0.99999994]]

Q^T Q = Q Q^T: True
Q^-1 = Q^T: True
```

#### **Back to $||QA||_F = ||A||_F$ for orthogonal Q**
Apply the identity to QA:

$$
||QA||_F^2 = tr((QA)^T (QA)) = tr (A^T Q^T QA) \\[0.5cm]

\text{Since Q is orthogonal } Q^T Q = I, \text{so:} \\[0.5cm]

||QA||_F^2 = tr (A^T A) = ||A||_F^2 \\[0.5cm]

\text{Both norms are nonnegative, so taking the square roots gives} ||QA||_F = ||A||_F
$$
