---
layout: inner
title: 'Aprendendo a aprender'
date: 2016-08-04 13:26:34
categories: aprendizado de maquina
tags: Torch7 Eletronica Computacao
lead_text: 'Aprendendo a aprender.'
---

Esse post eh um tutorial passo-a-passo para aprender e implementar sistemas de
aprendizado de maquina (machine learning).

Esse documento eh meu diario de pesquisa. Eh para eu relembrar os conceitos quando eu ficar velho.
Gramatica especialmente acentuacao nao eh importante aqui.

#Capitulo 1 - Preparo
Voce comprou um computador novo potente e com um cartao grafico poderoso da
NVIDIA. Para muitos eh uma maquina para jogar jogos legais. Mas com esse mesmo computador
da para criar modelos de aprendizado de maquina no estado da arte e criar aplicacoes
inovadoras e ganhar muito dinheiro, para depois mais jogo (eh claro).

Para criar maquina inteligente precisaremos de Ubuntu, pois muitas ferramentas que iremos usar
so suporta sistemas operacionais baseado em Unix: familia Linux e os MAC. Eu tenho um PC com
windows. Assim preciso criar um dualboot com Ubuntu. Nao vo usar maquina virtual pois para usar o cartao
grafico eh mais facil pelo dualboot do que usar maquina virtual, pois eh uma dor de cabeca para
virtualizar as portas PCI-e que sao usados pela cartao grafico. Para dualboot siga as instrucoes diponiveis aqui:
http://www.everydaylinuxuser.com/2015/11/how-to-install-ubuntu-linux-alongside.html


Tendo Ubuntu rodando, iremos precisar instalar varias coisas.
Lista de coisas importantes para instalar em um novo linux
sudo apt-get install vim tmux

##Instale Torch7:
http://torch.ch/docs/getting-started.html#_

Para mostra images podemos usar itorch.
https://github.com/facebook/iTorch


##Instale Cuda:
Baixe isso: https://developer.nvidia.com/cuda-toolkit
E rode o comando que o site mostra e instale tudo MENOS os drivers.

ATENCAO: Nao instale os drivers do NVIDIA isso pode explodir tudo. So instale drivers
se voce for o cara bom.
Quando voce instalo o dualboot os drivers sao instalados e configurados automaticamente
Se der ruim faca rasturacao ou veja isso: http://developer.download.nvidia.com/compute/cuda/7.5/Prod/docs/sidebar/CUDA_Quick_Start_Guide.pdf

Depois precisa de luarocks:
luarocks install cutorch
luarocks install cunn

Se quiser mais coisas instale:
https://github.com/soumith/cudnn.torch


##Instale mais dependencias:

sudo apt-get install libprotobuf-dev protobuf-compiler
luarocks install loadcaffe

Iremos usar a ferramenta torch7. Torch7 eh uma biblioteca de modulos de aprendizado
de maquina open-source desenvolvida pela comunidade. O mais legal eh que torch7 usa
como Lua como linguagem base de programacao. Lua foi criado no Rio de Janeiro (viva Brasil).
Lua eh parecido com matlab, javascript ou python, ou seja nao eh dificil de aprender.
http://tylerneylon.com/a/learn-lua/



#Capitulo 2 - Mao na massa



#Capitulo 3 - FPGA?


#Capitulo 4 - Papeis para ler




