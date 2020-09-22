# Provisioning

The provisioning of the virtual machines is done using iPXE, in order to accomplish that we need a dhcp server, a tftp server and an http server.

Dnsmasq is used as both the dhcp and the tftp server, the dhcp server gives address in the following range `192.168.100.10 - 192.168.100.250`, it also tells that iPXE is available at this ip address `192.168.100.1`.
The tftp server serve two files intended for the machines with no iPXE support, `undionly.ipxe` for the BIOS machines and `ipxe.efi` for the UEFI enabled machines.

* the unprovisioned machine boots up
* it receives an address from the dhcp server
* the dhcp server tells the machine that iPXE is available
* if the machine cannot use iPXE
  * if the machine do not use UEFI then it download `undionly.kpxe`
  * otherwise it download `ipxe.efi` 
* then the machine download the `boot.ipxe` iPXE script from `http://192.168.100.1/boot/boot.ipxe`
