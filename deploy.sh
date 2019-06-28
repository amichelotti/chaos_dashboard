#!/bin/bash

ver=`git log --pretty=format:'%h' -n 1`
echo "<font size="4">  ($ver)</font>" > version.html
if [ "$1" == "master" ];then
echo "* PRODUCTION"    
echo "   <b><font size="4" color=\"red\">Production</font></b>" > target.html
scp -r ../chaos_dashboard chaos@chaos-webui01.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
scp -r ../chaos_dashboard chaos@chaos-webui02.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
scp -r ../chaos_dashboard chaos@chaos-webui03.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
#scp -r ../chaos_dashboard chaos@chaos-webui1.chaos.lnf.infn.it:/var/www/html/chaos/
#scp -r ../chaos_dashboard chaos@chaos-webui2.chaos.lnf.infn.it:/var/www/html/chaos/
else
echo "* DEVELOPMENT/PREPRODUCTION"
echo "   <b><font size="4" color=\"green\">Development/Preproduction</font></b>" > target.html
scp -r ../chaos_dashboard chaos@chaost-webui01.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
scp -r ../chaos_dashboard chaos@chaost-webui02.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
fi


