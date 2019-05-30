#!/bin/bash
if [ "$1" == "master" ];then
    echo "   <b><font size="4" color=\"red\">Production</font></b>" > target.html
else
    echo "   <b><font size="4" color=\"green\">Development/Preproduction</font></b>" > target.html
fi
ver=`git log --pretty=format:'%h' -n 1`
echo "<font size="4">  ($ver)</font>" > version.html





