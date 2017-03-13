---
layout: inner
title: 'MicroZedboard setup'
date: 2016-09-01 13:26:34
categories: Getting started
tags: FPGA Zedboard
featured_image: ''
lead_text: 'This tutorial is to setup the Zedboard system.'
---
# 0. Intro
To start working on the Zedboard and deploying the FPGA design that you made.

# 1. Prepare U-Boot, Linux Kernel and Device tree.
In the boot partition of the SDcard, we need three files:


* uImage  - done in the build kernel section (linux-xlnx/arch/arm/boot/uImage)
* devicetree.dtb  - done in the build devicetree section (linux-xlnx/arch/arm/boot/dts/zynq-zed.dts)
* boot.bin  - follow the sections below


More information http://www.wiki.xilinx.com/Getting+Started

## Fetch Sources

There are two repos that will need to be cloned, one for u-boot and the other
for the linux kernel. Both repos are maintained by Xilinx.

Make sure to clone the folders u-boot-xlnx and linux-xlnx in the same directory of zynq-axis.

``` bash
git clone https://github.com/Xilinx/u-boot-xlnx
git clone https://github.com/Xilinx/linux-xlnx
```

## Setup Environmental Variables

Both the u-boot and the kernel will need to be built using the cross compile
tools. These tools should have been installed as part of the Xilinx ISE
package.

For vivado these tools where installed with SDK. Make sure to have SDK installed.

### Tool Location Variable

On the elab server it is:

``` bash
export XILINX_EDK=/export/home/a/workspace/Xilinx/14.4/ISE_DS/EDK
export PATH=$XILINX_EDK/gnu/arm/lin/bin:$PATH
```


On a default linux install:

``` bash
export XILINX_EDK=/opt/Xilinx/14.4/ISE_DS/EDK
export PATH=$XILINX_EDK/gnu/arm/lin/bin:$PATH
```

Or for Vivado


``` bash
export XILINX_SDK=/opt/Xilinx/SDK/2015.4
export PATH=$XILINX_SDK/gnu/arm/lin/bin:$PATH
```

### Cross Compile Variables

``` bash
export CROSS_COMPILE=arm-xilinx-linux-gnueabi-
```

### Kernel Build Variables


Only needed to build the kernel.

``` bash
export ARCH=arm
export PATH=$PWD/u-boot-xlnx/tools:$PATH
```

## Dependencies
There may be some dependencies and packages that need to be installed before building the u-boot:

(http://forums.xilinx.com/t5/Embedded-Linux/Xilinx-Zynq-7000-ZC702-Linux-build-issue/m-p/426328#M8213)

* gawk
* build-essential
* utomake
* libtool
* lib32ncurses5
* lib32ncurses5-dev
* lib32ncursesw5
* ncurses-dev:i386
* libstdc++6:i386
* libselinux1:i386
* libgmpxx4ldbl
* libppl13
* libppl-c4
* libcloog-ppl1


``` bash
sudo apt-get install ia32-libs
sudo apt-get install u-boot-tools lzop
sudo apt-get install libssl-dev
```

## Build u-boot


The linux system boots using u-boot from an SD Card root file system.


Then go to the u-boot-xlnx folder
``` bash
cd u-boot-xlnx
```

### Patch boot options


We don't want a ramdisk rootfs because the system (OS kernel and applications) is copied from SDcard to a RAM memory during boot.
And all the work done on the system is saved on a RAM, which means that it will disappear once we turn off the zedboard.
To avoid this, we want to boot and run the system on SDcard so that we can save our modifications.


The Xilinx standard u-boot master assumes a ramdisk rootfs. This patch will
ensure the SD card boots from the rootfs on the SD card.

``` bash
echo '
diff --git a/include/configs/zynq-common.h b/include/configs/zynq-common.h
--- a/include/configs/zynq-common.h
+++ b/include/configs/zynq-common.h
@@ -241,7 +241,7 @@
        "sdboot=if mmcinfo; then " \
			"run uenvboot; " \
			"echo Copying Linux from SD to RAM... && " \
			"load mmc 0 ${kernel_load_address} ${kernel_image} && " \
			"load mmc 0 ${devicetree_load_address} ${devicetree_image} && " \
-			"load mmc 0 ${ramdisk_load_address} ${ramdisk_image} && " \
-			"bootm ${kernel_load_address} ${ramdisk_load_address} ${devicetree_load_address}; " \
+			"bootm ${kernel_load_address} - ${devicetree_load_address}; " \
		"fi\0" \
	"usbboot=if usb start; then " \
			"run uenvboot; " \
			"echo Copying Linux from USB to RAM... && " \
			"load usb 0 ${kernel_load_address} ${kernel_image} && " \
' | git apply -
```

Get rid of the line that has -


and add the line that has +

Change the MACaddr of the device in include/configs/zynq-common.h

``` bash
"ethaddr=00:0a:35:02:95:e3\0"
```

### Building u-boot tools
http://www.wiki.xilinx.com/Build+U-Boot

``` bash
make zynq_zc706_config
```
or
``` bash
make zynq_zed_config
make
```

Only needed to build the kernel.
After building the u-boot, the target u-boot elf-file is created in the top level source directory, named 'u-boot'.
Additionally in the tools/ directory the 'mkimage' utility is created, which is used in other tasks to wrap images into u-boot format.
To make mkimage available in other steps, it is recommended to add the tools directory to your $PATH.

``` bash
export ARCH=arm
export PATH=$PWD/u-boot-xlnx/tools:$PATH
```


## Build Linux Kernel

See http://www.wiki.xilinx.com/Build+kernel


Make sure that CMA config are correct in /arch/arm/configs/xilinx_zynq_defconfig
and in .config file.

``` bash
CONFIG_DMA_CMA=y
CONFIG_CMA_SIZE_MBYTES=128
```
Then build kernel with:
``` bash
make -j2 ARCH=arm xilinx_zynq_defconfig
make -j2 ARCH=arm menuconfig
make -j2 ARCH=arm UIMAGE_LOADADDR=0x8000 uImage
```


In the process, linux-xlnx/arch/arm/boot/Image and linux-xlnx/arch/arm/boot/zImage are created.
The Image file is the uncompressed kernel image and the zImage file is a compressed kernel image which will uncompress itself when it starts.


If the mkimage utility is available in the build environment, linux-xlnx/arch/arm/boot/uImage will be created by wrapping zImage with a U-Boot header.


### Compiler version Troubleshooting
The gcc compiler versions below are not supported:
 * GCC 3.0, 3.1: general bad code generation.
 * GCC 3.2.0: incorrect function argument offset calculation.
 * GCC 3.2.x: miscompiles NEW_AUX_ENT in fs/binfmt_elf.c (http://gcc.gnu.org/PR8896) and incorrect structure initialisation in fs/jffs2/erase.c


 * GCC 4.8.0-4.8.2: https://gcc.gnu.org/bugzilla/show_bug.cgi?id=58854 miscompiles find_get_entry(), and can result in EXT3 and EXT4 filesystem corruption (possibly other FS too).


Make sure the gcc compiler version is not 4.8.1 or 4.8.2


``` bash
gcc -v
```


If it is then try to change the default gcc to a lower version, by switching the gcc link "/usr/bin/gcc":


``` bash
apt-get install gcc-4.7
sudo rm /usr/bin/gcc
sudo ln -s /usr/bin/gcc-4.7 /usr/bin/gcc
```


Make sure the arm-xilinx-linux-gnueabi-gcc version is not 4.8.1 or 4.8.2


asm-offses.c will output an error (buggy compiler) if arm-xilinx-linux-gnueabi-gcc version is 4.8.1 or 4.8.2


Check with:


``` bash
arm-xilinx-linux-gnueabi-gcc -v
```


## Build Device Tree

Patch the default zedboard device tree source file mount the root file system
from the second partition of the SD card instead of ram.


Change the file linux-xlnx/arch/arm/boot/dts/zynq-zed.dts


``` bash
echo '
diff --git a/arch/arm/boot/dts/zynq-zed.dts b/arch/arm/boot/dts/zynq-zed.dts
--- a/arch/arm/boot/dts/zynq-zed.dts
+++ b/arch/arm/boot/dts/zynq-zed.dts
@@ -40,7 +40,7 @@
 	memory {
		device_type = "memory";
		reg = <0x0 0x20000000>;
	};
 	chosen {
-		bootargs = "console=ttyPS0,115200 root=/dev/ram rw earlyprintk";
+		bootargs = "cma=128M console=ttyPS0,115200 root=/dev/mmcblk0p2 rw earlyprintk rootfstype=ext4 rootwait devtmpfs.mount=0";
 		linux,stdout-path = "/axi@0/serial@e0001000";
 	} ;
    };

    &qspi {

' | git apply -
```


Then build the device tree blob.


``` bash
make zynq-zed.dtb
```

### Modifying Devicetree for AXIS

The following AXIS device node needs to be added to the Zynq devicetree to expose the new hardware to the AXIS driver.
Add this code to arch/arm/boot/dts/zynq-7000.dtsi inside of amba.

``` bash
axis: axis@43C00000 {
    compatible = "xlnx,axis-1.00";
    reg = < 0x43C00000 0x10000 >;
    xlnx,num-mem = <0x1>;
    xlnx,num-reg = <0x20>;
    xlnx,s-axi-min-size = <0x1ff>;
    xlnx,slv-awidth = <0x20>;
    xlnx,slv-dwidth = <0x20>;
};
```
Or

Source code for a usable and tested devicetree has been placed in the zynq-axis/util directory.
It is an altered version of the 'arch/arm/boot/dts/zynq-7000.dtsi' file found in the linux-xlnx Xilinx repo,
master branch commit (da2d296bb6b89f7bc7644f6b552b9766ac1c17d5).


Once the kernel has been compiled for the Zynq, place the altered 'zynq-7000-dtsi' file into the kernel 'arch/arm/boot/dts' directory.
Then compile the new devicetree, for the Zedboard run the following command.


``` bash
make zynq-zed.dtb
```



# 3. Making a Bootable SDcard with Linaro Linux for Zynq


We need two partitions on the SDcard: one for boot and one for the Linaro Linux system

In the boot partition of the SDcard, we need three files:


* uImage  - done in the build kernel section (linux-xlnx/arch/arm/boot/uImage)
* devicetree.dtb  - done in the build devicetree section (linux-xlnx/arch/arm/boot/dts/zynq-zed.dts)
* boot.bin  - follow the sections below


Instructions to setup our custom, headless Linaro system for the Zedboard/Zynq.
Very good source [guide](http://fpgacpu.wordpress.com/2013/05/24/yet-another-guide-to-running-linaro-ubuntu-desktop-on-xilinx-zynq-on-the-zedboard).


## Partition SD Card:

```bash
sudo apt-get install gparted
sudo gparted
```

2 partitions, 1st is 40 MB, fat32 and Labeled "BOOT". 2nd partition is 2048 MB,
ext4 and Labeled "rootfs".


Once you partitioned the SDcard, check if there are two partitions to be mounted:

```bash
sudo fdisk -l
```
You should see something with "/dev/sdb1" and "/dev/sdb2" in the output

Mount both partitions:
```bash
sudo  mkdir /media/BOOT
sudo  mkdir /media/rootfs
sudo mount /dev/sdb1 /media/BOOT
sudo mount /dev/sdb2 /media/rootfs
```


Once you are done making the SDcard, dont forget to un-mount it
```bash
sudo umount /media/sdb1
sudo umount /media/sdb2
```

## Download linaro rootfs:


http://www.linaro.org/downloads/

Scroll to the "Developers and Community Builds" section. In the table entry for
"Ubuntu Desktop" click one of the links in the "download" section.

As of writing this was the latest "desktop" release URL is.

```bash
wget https://releases.linaro.org/archive/12.11/ubuntu/precise-images/ubuntu-desktop/linaro-precise-ubuntu-desktop-20121124-560.tar.gz
```

or

```bash
wget https://releases.linaro.org/14.10/ubuntu/trusty-images/developer/linaro-trusty-developer-20141024-684.tar.gz
```

## Copy files to SD Card

After downloading the Linaro, you need to extract the tar.gz into the rootfs partition in the SDcard.


```bash
sudo tar --strip-components=3 -C /media/rootfs -xzpf linaro-precise-ubuntu-desktop-20121124-560.tar.gz binary/boot/filesystem.dir
```


After following the section "2. Prepare U-Boot, Linux Kernel and Device tree",
you can copy uImage and devicetree file to BOOT partition of the SDcard


copy uImage from linux-xlnx/arch/arm/boot/uImage to /media/BOOT/


copy zynq-zed.dtb file from linux-xlnx/arch/arm/boot/dts/ to /media/BOOT/ and rename as "devicetree.dtb"


## Build FSBL (First stage boot loader)

Look into xilinx document chapter 5 http://forums.xilinx.com/xlnx/attachments/xlnx/ELINUX/8467/1/zedboard_CTT_v2013_2_130807.pdf

In order to relate the software (Linux) with the hardware PL (programable logic) that you created,
we need to create a FSBL(first state boot loader) application in Xilinx SDK program.
Thus, we need the hardware from  section "1. Hardware".
Remember that the Vivado project is in /zynq-axis-master/syn/scratch/project-zedboard_axis/
But, the generated bitstream file is in /zynq-axis-master/zedboard_axis.bit


In the Vivado program, after the Bitstream generation completes,
you need to export the hardware File > Export > Export Hardware
(make sure that you enable the "Include Bitstream" option).


Then launch SDK.


In SDK, select File > New > Application Project.
The New Project wizard opens; for Project Name, type in zynq_fsbl_0 and
click Next.


Select Zynq FSBL in the Template list and keep the remaining default options.
The Location of your project, the hardware platform used, and the processor are
visible in this window.


Click Finish to generate the FSBL.


The Zynq FSBL compiles and .ELF file is generated in the folder


your_project_path / project_name.sdk / zynq_fsbl_0 / Debug /



## Generate BOOT.BIN file

To generate the last file need for the SDcard, we need to get copy of:

* system.bit (zedboard_axis.bit - bitfile generated in Vivado),
* u-boot.elf (in u-boot-xlnx folder. Need to rename u-boot to u-boot.elf) and
* zynq_fsbl.elf (created using Xilinx SDK).

Then create a .bif file.

```bash
echo -n 'the_ROM_image:
{
[bootloader]zynq_fsbl.elf
zedboard_axis.bit
u-boot.elf
}
' > bootconfig.bif

bootgen -image bootconfig.bif -o i boot.bin
```

You can also use the SDK to generate the boot.bin. Refer to xilinx tutorial.


Don't forget to copy the boot.bin to /media/BOOT/


## Bootup

The above instructions should make a bootable SD Card. Make sure the jumpers
are set correctly on the Zedboard, insert SD Card and power up.

Jumpers: JP7-GND, JP8-GND, JP9-3V, JP10-3V, JP11-GND

Connect a USB to the UART port and start up a Serial Terminal (eg. gtkterm) to
view boot messages and get first access to the system.


# 4. Linux UIO Driver


This Linux driver has been developed to run on the Xilinx Zynq ARM. It is a userspace input/output driver (UIO) that enables the passing of register values to and from the Zynq FPGA. Userspace libraries/applications use this UIO driver to configure and control the AXIS modules operation. It also controls a contiguous memory area that is used to pass data between the host (PS) and FPGA (PL) sides of the Zynq.


## Compile Driver


Kernel modules need to be built against the version of the kernel it will be inserted in. It is recommended to uses the Linux kernel maintained by Xilinx.
https://github.com/Xilinx/linux-xlnx.git


The driver module can be compiling outside of the Linux kernel source tree.
A variable 'KDIR' in the Makefile is used to point to the kernel source directory.
The default value has it pointing to the default Linux install location for kernel sources.
However, if cross compiling or if the sources are in a non-default location the value can be overridden using
an exported environmental variable or as an argument passes into the make command.
Assuming that folder linux-xlnx and zynq-axis are in the same directory.

``` bash
cd zynq-axis/dev/
export KDIR=../../linux-xlnx
make
```

or

``` bash
cd zynq-axis/dev/
make KDIR=../../linux-xlnx
```
After compiling the driver, you need to have the zynq-axis files on the zedboard (embedded linux).

One way to do this is to copy the folder zynq-axis to the rootfs partition of the SDcard.


The following sections are done in the embedded linux through a serial connection (eg. gtkterm or putty).

## Installing Driver

Use of the driver module requires it to be inserted into the running Linux kernel. Once inserted it will automatically create a character device file in '/dev' called '/dev/uio*'. However, the default permissions will not allow non-root users to read/write to the file, nor is the numbering consistent if more then one UIO driver is being used. These problems are overcome by installing the udev rule file found in this projects util directory into the systems '/etc/udev/rules.d/' directory.
``` bash
sudo cp util/80-axis.rules /etc/udev/rules.d/
```

To install the module and have it loaded at boot, first install the udev rule as shown above and then follow the below instructions.
``` bash
sudo mkdir -p /lib/modules/$(uname -r)/extra/
sudo cp axis.ko /lib/modules/$(uname -r)/extra/
sudo depmod -a
```
Need reboot here.

``` bash
sudo reboot
sudo modprobe axis
```


If there is error saying that Kernel dont have support axis.ko after sudo modprobe axis

Then your Kernel or your driver was build wrong. Redo section "2.Build Linux Kernel" and load the newest uImage into SDcard.
Also do section "4. Compile Driver" again and load the newest zynq-axis/dev folder into SDcard

## Library

The axis library has to be built and installed on the Zynq before the example applications can be compiled. The library offers a number of generic functions for use in configuring the axis hardware.
``` bash
cd zynq-axis/lib/
make
make install
```

## Applications

The example application demonstrates some simple usage of the AXIS system.
``` bash
cd zynq-axis/app/
make
```
Try it out:
``` bash
cd zynq-axis/app/
./test-mem /dev/axis
```

# 5.Customize Linaro System

The following have been done to make the *elab* system.


## Turn off swapping:

This reduces the amount of data being written to the SD card and thus make it
less likely to throw an error during heavy use. Since the linaro system is not
being used for any RAM heavy task this is unlikely to cause problems. It also
reduces the likelihood of the system crashing during the running of our demos.

```bash
echo "vm.swappiness = 0" | sudo tee -a /etc/sysctl.conf
sudo reboot
```

You cat find out what the systems 'swapiness' is set to using:

```bash
cat /proc/sys/vm/swappiness
```


## Turn off logging:

Logging on our system can quickly use up all available space on the SD card by
writing to the "/var/log/kern.log" file and "/var/log/syslog" file. The easiest
way to stop that is to turn off system logging:

```bash
echo manual | sudo tee --append /etc/init/rsyslog.override
```
source (http://askubuntu.com/questions/306237/how-to-disable-the-log-files)


## Use tmpfs for some system directories

When the system writes to any of these system directories they will write to a
ram disk instead of the SD card. This reduces the number and frequency of
writes to the SD card and thus makes the system ans a whole more stable.

```bash
echo -n '
tmpfs        /var/run       tmpfs    defaults,noatime    0    0
tmpfs        /var/lock      tmpfs    defaults,noatime    0    0
tmpfs        /var/log       tmpfs    defaults,noatime    0    0
tmpfs        /var/run       tmpfs    defaults,noatime    0    0
tmpfs        /var/mail      tmpfs    defaults,noatime    0    0
tmpfs        /var/spool     tmpfs    defaults,noatime    0    0
tmpfs        /var/tmp       tmpfs    defaults,noatime    0    0
tmpfs        /var/cache     tmpfs    defaults,noatime    0    0
' | sudo tee -a /etc/fstab

```

## SSH Server:

Dropbear

```bash
apt-get install -y dropbear
```

make it so root cannot ssh in.

vim /etc/default/dropbear
DROPBEAR_EXTRA_ARGS="-w"


## Time on the Zedboard

The Zedboard will forget the time on a power cycle, to work around this have
the Zedboard get the time from the network.


### Setting Clock with NTP (network time protocol):

sudo apt-get install -y ntp

sudo ntpdate horologe.cerias.purdue.edu

(http://askubuntu.com/questions/244526/unable-to-synchronize-time-using-ntp)

sudo vim /etc/ntp.conf # add line: "server horologe.cerias.purdue.edu" to file


### Time Zone:

sudo dpkg-reconfigure tzdata

(http://www.wikihow.com/Change-the-Timezone-in-Linux)


## IP Monitor Script

A small script will be setup to run at boot that will monitor when a new dhcp
lease has been acquired. A new dhcp lease is always acquired when a new IP
address is assigned to the Zedboard by a dhcp server.

First, a non-pass-phrase protected ssh key pair needs to be generated so that
the monitor script can communicate with the elab server without requiring a
password. This can be done on a computer that has OpenSSH installed and then by
copying the two key files over to the Zedboard. Once the keys are on the
Zedboard, rename the two key files "rsync_id_rsa" and "rsync_id_rsa.pub", then
move them to a directory called "$HOME/.ip_addr/".

On the server:

```bash
ssh-keygen -t rsa -f rsync_id_rsa
```


On the zynq:

```bash
mkdir -p $HOME/.ip_addr
cp rsync_id_rsa* $HOME/.ip_addr/
chmod 400 $HOME/.ip_addr/rsync_id_rsa*
```

To enable auto log-in from Zedboard to server, the contents of
"rsync_id_rsa.pub" needs to be added to the ".ssh/authorized_keys" file on the
elab server. For safety it is best to restrict the actions of the ssh key to
just rsync of a single directory. Thus when adding the ssh pub key to the elabs
".ssh/authorized_keys" file, include the following 'command' to the entry:

```
command="rsync --server -vvvlogDtpre.iLsf . ${HOME}/.ip_addr/" ssh-rsa <zedboard ssh-rsa pub key> linaro@zynq
```

Remember to replace <zedboard ssh-rsa pub key> with __your__ ssh-rsa public key
from the Zedboard. Then create the monitor program on the Zedboard:


```bash
apt-get install -y inotify-tools
mkdir $HOME/.ip_addr
echo -n '
sleep 2
hostname -I > /home/linaro/.ip_addr/ip-addr-$(hostname)

if [ -n "$(cat /home/linaro/.ip_addr/ip-addr-$(hostname) | tr -d " ")" ]
then
	rsync -a -e "ssh -i ${HOME}/.ip_addr/rsync_id_rsa" ${HOME}/.ip_addr/ip-addr-$(hostname) <username>@elab.ecn.purdue.edu:${HOME}/.ip_addr
else
	sleep 60
	hostname -I > /home/linaro/.ip_addr/ip-addr-$(hostname)

	if [ -z "$(cat /home/linaro/.ip_addr/ip-addr-$(hostname) | tr -d " ")" ]
	then
		echo "reboot"
		sudo reboot
	fi
fi


while inotifywait -e modify -e create -e delete -e move -r $1; do
	sleep 2
	hostname -I > /home/linaro/.ip_addr/ip-addr-$(hostname)

	if [ -n "$(cat /home/linaro/.ip_addr/ip-addr-$(hostname) | tr -d " ")" ]
	then
		rsync -a -e "ssh -i ${HOME}/.ip_addr/rsync_id_rsa" ${HOME}/.ip_addr/ip-addr-$(hostname) <username>@elab.ecn.purdue.edu:${HOME}/.ip_addr
	else
		sleep 60
		hostname -I > /home/linaro/.ip_addr/ip-addr-$(hostname)

		if [ -z "$(cat /home/linaro/.ip_addr/ip-addr-$(hostname) | tr -d " ")" ]
		then
			echo "reboot"
			sudo reboot
		fi
	fi
done
' > $HOME/.ip_addr/ip-monitor
chmod 744 $HOME/.ip_addr/ip-monitor
```

Edit /etc/rc.local script and add the following before 'exit 0':

```bash
su -l linaro -c '/home/linaro/.ip_addr/ip-monitor /var/lib/dhcp &> /dev/null &'
```


On elab server add to your "$HOME/.bashrc" file:

```bash
function linaro() {
	while [ 1 ]
	do
		case "$1" in
			p) cat $HOME/.ip_addr/ip-addr-<zync hostname> | tr -d ' '; break;;
			b) ssh -o ConnectTimeout=1 -i ~/.ssh/id_rsa_zynq linaro@$(cat $HOME/.ip_addr/ip-addr-<zync hostname> | tr -d ' '); break;;
			*) ssh -X -t -q -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ConnectTimeout=1 -i ~/.ssh/id_rsa_zynq linaro@$(cat $HOME/.ip_addr/ip-addr-<zynq hostname> | tr -d ' ') "tmux attach -d || tmux new"; sleep 3;;
		esac
	done
}
```

If the Zedboard changes IP addresses while you are logged in, the ssh session
will freeze. The 'ConnectTimeout' in the above commands will automatically end
the session after a second. Alternatively, you can add the following line to the
".ssh/config" file on the elab server.

```
ServerAliveInterval 1
```

The above 'linaro' function works best when you have auto login using ssh keys.
If however your default ssh key is password protected you might fine it best to
generate second key for use just with the Zedboard. To use the 2nd key add the
'-i' flag to the ssh commands in the 'linaro' function, example below.

```
-i ~/.ssh/id_rsa_zynq
```

## Rename System

Edit /etc/hostname to be the new hostname

and edit last line in /etc/hosts

127.0.1.1       <new hostname>


## Mount SD Card Partitions

Add:

```
devtmpfs.mount=1
```

to the bootargs in the devicetree. This will get the mmcblk0 device to show up.

To make it easy to mount a partition (for example the "boot" partition) by a
user (without using sudo), add the following to the "/etc/fstab" file.


```
/dev/mmcblk0p1  /boot   vfat    defaults,noauto,users   0       0
```

## Workaround for cpufreq error

Since the zynq is having problems with changing the scaling of the clock
frequency the Linaro system must limit the number of frequencies it can use.
The following workaround should be applied when the error "cpufreq_cpu0: failed to
set clock rate: -16" shows up in the UART or/and when the reported system clock
is slower then the wall clock time.

``` bash
sudo update-rc.d ondemand disable
```
The above was taken from the following Xilinx forum discussion.

http://forums.xilinx.com/t5/Embedded-Linux/System-clock-is-slow/m-p/411993/highlight/true#M7830

## Linux setup

## thnets
dependencies:
sudo apt-get install libjpeg-dev
sudo apt-get install libpng-dev

## update gcc

sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt-get update
sudo apt-get install gcc-4.9 g++-4.9
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.9 60 --slave /usr/bin/g++ g++ /usr/bin/g++-4.9

## auto mound sdcard
Add mount /dev/mmcblk0p1 /root/sdcard to .bashrc file

##ssh
Install ssh stuff:
apt-get install -y dropbear

sudo apt-get install openssh-client openssh-server

Change passwd for linaro and root account.
The default password is: linaro
sudo passwd

##torch
install torch: follow this http://torch.ch/docs/getting-started.html
But it gives error.
Them change ubuntu to linaro in the install-deps and install libzmq-dev and remove libzmq3-dev.

vim install-deps
:%s/ubuntu/linaro/gc
:%s/libzmq3-dev/libzmq-dev/gc

##ssh static ip
https://www.maketecheasier.com/static-ip-address-setup-ssh-on-raspberry-pi/
https://www.cyberciti.biz/faq/linux-configure-a-static-ip-address-tutorial/
https://www.howtoforge.com/linux-basics-set-a-static-ip-on-ubuntu

Need to change /etc/network/interfaces and /etc/resolv.conf

First find a ip address not used. (see nmap http://www.cyberciti.biz/networking/nmap-command-examples-tutorials/)

nmap -sP 192.168.1.0/24

ip address that don't have dhcp and no one is using.

Then, find the line which reads iface eth0 inet dhcp and replace it with:
sudo vim /etc/network/interfaces

auto eth0
iface eth0 inet static
address 192.168.1.20
netmask 255.255.255.0
gateway 192.168.1.1

## Rename System

Edit /etc/hostname to be the new hostname

and edit last line in /etc/hosts

127.0.1.1       <new hostname>

##
