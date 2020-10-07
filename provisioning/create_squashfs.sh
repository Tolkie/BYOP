#!/usr/bin/env bash

UBUNTU_VERSION_NAME=""
DEBOOTSTRAP_FOLDER=""
SKIP_DEBOOTSTRAP=false
SKIP_POSTINSTALL=false
USE_TMP_DIR=false

function print_help() {
	echo -e "USAGE $0: -v <ubuntu-version-name> [ -d <debootstrap-folder> ] [ -s ] [ -p ]\n" \
		"\n" \
		"\t-v <ubuntu-version-name>\tthe name of the ubuntu version\n" \
		"\t-d <debootstrap-folder>\t\tthe path to the debootstrap folder, if empty a\n" \
		"\t\t\t\t\ta temporary directory will be created\n\n" \
		"\t-s\t\t\t\tskip the debootstrap part and use the specified folder\n" \
		"\t-p\t\t\t\tskip the postinstall part and directly create the squashfs"

}

function parse_arguments() {
    for arg in "$@"; do
	shift
	case "$arg" in
		"--help")                  set -- "$@" "-h";;
		"--ubuntu-version")        set -- "$@" "-v";;
		"--debootstrap-directory") set -- "$@" "-d";;
		"--skip-debootstrap")      set -- "$@" "-s";;
		"--skip-postinstall")      set -- "$@" "-p";;
		*)                         set -- "$@" "$arg"
	esac
    done

    OPTIND=1
    while getopts "hv:d:sp" opt; do
        case "$opt" in
            "h")
                print_help
                exit 0
                ;;
            "v")
                [ -z "$OPTARG" ] && echo "ERROR: the ubuntu version name can not be null" >&2 && exit 1
                UBUNTU_VERSION_NAME="$OPTARG"
                ;;
            "d")
                [ -z "$OPTARG" ] && echo "ERROR: the debootstrap folder can not be null" >&2 && exit 1
                DEBOOTSTRAP_FOLDER="$OPTARG"
                ;;
            "s")
                SKIP_DEBOOTSTRAP=true
                ;;
            "p")
                SKIP_POSTINSTALL=true
                ;;
            "?")
                print_help >&2
                exit 1
                ;;
        esac
    done
    shift $(expr $OPTIND - 1)

    if [ -z "$UBUNTU_VERSION_NAME" ]; then
    	echo "ERROR: the ubuntu version name has to be specified" >&2 && exit 1
    fi
    
    if [ "$SKIP_DEBOOTSTRAP" = true ] && [ -z "$DEBOOTSTRAP_FOLDER" ]; then
        echo "ERROR: can't skip the debootstrap step without specifying a folder" >&2 && exit 1
    fi

    if [ -z "$DEBOOTSTRAP_FOLDER" ]; then
        DEBOOTSTRAP_FOLDER=$(mktemp -d -t byop-XXXXXXXXXX)
	USE_TMP_DIR=true!
    fi
}

function post_install() {
    mount -t proc $DEBOOTSTRAP_FOLDER/proc
    mount --bind /dev $DEBOOTSTRAP_FOLDER/dev
    mount --bind /dev/pts $DEBOOTSTRAP_FOLDER/dev/pts
    mount --bind /sys $DEBOOTSTRAP_FOLDER/sys

    cp /etc/apt/sources.list $DEBOOTSTRAP_FOLDER/etc/apt/sources.list
    cp /etc/hosts $DEBOOTSTRAP_FOLDER/etc/hosts
    cp /etc/resolv.conf $DEBOOTSTRAP_FOLDER/etc/resolv.conf

    cp ./postinstall_script.sh $DEBOOTSTRAP_FOLDER/.
    chroot $DEBOOTSTRAP_FOLDER ./postinstall_script.sh
    rm $DEBOOTSTRAP_FOLDER/postinstall_script.sh

    umount $DEBOOTSTRAP_FOLDER/dev/pts
    umount $DEBOOTSTRAP_FOLDER/dev
    umount $DEBOOTSTRAP_FOLDER/sys
    umount $DEBOOTSTRAP_FOLDER/proc
}

parse_arguments "$@"

if [ $SKIP_DEBOOTSTRAP = false ]; then
    debootstrap --include ubuntu-minimal --arch amd64 $UBUNTU_VERSION_NAME $DEBOOTSTRAP_FOLDER http://archive.ubuntu.com/ubuntu
fi

if [ $SKIP_POSTINSTALL = false ]; then
    post_install 
fi

mksquashfs $DEBOOTSTRAP_FOLDER filesystem.squashfs
cp $DEBOOTSTRAP_FOLDER/boot/vmlinuz .
cp $DEBOOTSTRAP_FOLDER/boot/initrd.img .

if [ $USE_TMP_DIR = true ]; then
    rm -rf $DEBOOTSTRAP_FOLDER
fi

