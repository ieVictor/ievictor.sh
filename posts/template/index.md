---
title: This should be a post
subtitle: >-
  Proposal to use neural net face-recognition embeddings to power a human
  face-recognition training app by matching and generating or selecting faces
  based on NN-measured difficulty, inspired by triplet training loss.
author:
  name: Victor Gabriel Lucio
metadata:
  readTime: 22 minutes
  status: finished
  edited: '2026-07-19 15:25'
---
> We might be able to train people to better recognize faces the same way we teach NNs to recognize faces, with a triplet loss: present 3 faces at a time, and pick the mismatching one. And then we can use NNs to choose or generate the triplets as well, letting us scale indefinitely a curriculum of increasingly difficult, diverse, realistic face recognition problems.
> This could be easily implemented as an automated adaptive-difficulty web app using public datasets and NN models, going beyond the prior small-scale research efforts, and so is worth trying if no one has already.

## Latex Render
LaTeX (/ˈlɑːtɛx/ LAH-tekh or /ˈleɪtɛx/ LAY-tekh, to rhyme with "blech"[2]), often stylized as LaTeX, is a software system for typesetting documents,[3] based on the TeX typesetting system. LaTeX provides a high-level, descriptive markup language to use TeX more easily: TeX handles the document layout, while LaTeX handles the content side for document processing. Because the plain TeX formatting commands are elementary, it provides authors with ready-made commands for formatting and layout requirements such as chapter headings, footnotes, cross-references and bibliographies.

## History
In the early 1980s, Leslie Lamport was working at SRI, where he needed to write TeX macros for his own use. He thought that with a little extra effort, he could make a general package usable by others. Having done so, he released versions of his LaTeX macros in 1984 and 1985. Peter Gordon, an editor at Addison-Wesley, convinced Lamport to write a LaTeX user's manual for publication. Lamport was initially skeptical that anyone would pay money for it,[10] but it came out in 1986[3] and sold hundreds of thousands of copies.[10] On 21 August 1989, at a TeX Users Group (TUG) meeting at Stanford, Lamport agreed to turn over maintenance and development of LaTeX to Frank Mittelbach. Mittelbach, along with Chris Rowley and Rainer Schöpf, formed the LaTeX3 team; in 1994, they released LaTeX2e, the current standard version. LaTeX3 has been discontinued as a separate format; since 2018, it has been a programming layer within LaTeX2e.

### Typesetting system
LaTeX attempts to follow the design philosophy of separating presentation from content, so that authors can focus on the content of what they are writing without attending simultaneously to its visual appearance. In preparing a LaTeX document, the author specifies the logical structure using commands such as chapter, section, table, figure, etc., and lets the LaTeX system handle the formatting and layout of these structures. As a result, it encourages the separation of the layout from the content – while still allowing manual typesetting adjustments whenever needed. This concept is similar to the mechanism by which many word processors allow styles to be defined globally for an entire document, or the use of Cascading Style Sheets in styling HyperText Markup Language (HTML) documents.

The LaTeX system is a markup language that handles typesetting and rendering,[11] and can be arbitrarily extended by using the underlying macro language to develop custom macros such as new environments and commands. Such macros are often collected into packages, which could then be made available to address some specific typesetting needs such as the formatting of complex mathematical expressions or graphics (e.g., the use of the align environment provided by the amsmath package to produce aligned equations).

### Pronunciation and typography
The characters 'T', 'E', and 'X' in the name come from the Greek capital letters tau, epsilon, and chi, as the name of TeX derives from the Ancient Greek: τέχνη ('skill', 'art', 'technique'); for this reason, TeX's creator Donald Knuth promotes its pronunciation as /tɛx/ (tekh)[20] (that is, with a voiceless velar fricative as in Modern Greek, or the 'ch' in 'loch'). Lamport remarks that "TeX is usually pronounced tech, making lah-tech, lah-tech, and lay-tech the logical choices; but language is not always logical, so lay-tecks is also possible."[21]

The name is printed in running text with a typographical logo: LaTeX. In media where the logo cannot be precisely reproduced in running text, the word is typically given the unique capitalization LaTeX. Alternatively, the TeX, LaTeX,[22] and XeTeX[23] logos can also be rendered via pure CSS and XHTML for use in graphical web browsers – by following the specifications of the internal \LaTeX macro.[24]

| Something | Anotherthing |
| -------------- | --------------- |
| Data 1 | Response 1 |
| Data 2 | Response 2 |
| Data 2 | Response 2 |
| Data 2 | Response 2 |
| Data 2 | Response 2 |


## Versions
LaTeX2e is the current version of LaTeX, since it replaced LaTeX 2.09 in 1994.[40] As of 2020, LaTeX3, which started in the early 1990s, is under a long-term development project.[5] Planned features include improved syntax (separation of content from styling), hyperlink support, a new user interface, access to arbitrary fonts and a new documentation.[41] Some LaTeX3 features are available in LaTeX2e using packages,[42] and by 2020 many features have been enabled in LaTeX2e by default for a gradual transition.[5]

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

print(f"{Af=}")
print(f"{Af**2=}")
print(f"{QAf=}")
print(f"{trace=}")
```

**Result:**
```text
Af=<tf.Tensor: shape=(), dtype=float32, numpy=9.539392471313477>
Af**2=<tf.Tensor: shape=(), dtype=float32, numpy=91.00000762939453>
QAf=<tf.Tensor: shape=(), dtype=float32, numpy=9.539392471313477>
trace=<tf.Tensor: shape=(), dtype=float32, numpy=91.0>
```
