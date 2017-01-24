---
layout: post
category: deep_learning
title: Notes On Deep Learning Training
date: 2015-12-12
---

These notes come from a deep learning dicussion group.

# Convolution VS. Correlation

It comes from one basic fact that although we call CNN *Convolutional* Nerual Network, 
actually it is *Correlational* Nerual Network for most famous deep learning frameworks implement *Convolution* as *Correlation*.
(except Theano, which does use Convolution to implement convolution layer). 

Bengio in his book *Deep Learning* has pointed out this:

many neural network libraries implement arelated function called the cross-correlation, 
which is the same as convolution butwithout ﬂipping the kernel:

(From [http://www.deeplearningbook.org/contents/convnets.html](http://www.deeplearningbook.org/contents/convnets.html),
Draft Version 2016-03-11, page 337.)

# About activation function

Batch Normalization and PReLU cannot work appropriately. (why?)