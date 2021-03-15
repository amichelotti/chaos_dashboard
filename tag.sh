#!/bin/bash
ver=`git log --pretty=format:'%h' -n 1`
if [ -z "$NOWS" ];then
     export NOWS=$(date +"%Y%m%d")
fi
if [ -z "$CI_PIPELINE_ID" ];then
     export CI_PIPELINE_ID=666
fi
if [ -z "$CI_COMMIT_REF_NAME" ];then
     export CI_COMMIT_REF_NAME=`git branch --show-current`
fi

buildstr_short="$NOWS-$ver-$CI_PIPELINE_ID"
buildstr="$CI_COMMIT_REF_NAME-$buildstr_short"
echo "<script>const VERSION=\"$buildstr\";</script>" > version.html
if [ "$CI_COMMIT_REF_NAME" == "master" ]; then echo "   <b><font size=\"4\" color=\"red\">Production</font></b><font size=\"1\"> $buildstr_short</font>" >> version.html; 
else echo "   <b><font size=\"4\" color=\"green\">$CI_COMMIT_REF_NAME</font></b><font size=\"1\"> $buildstr_short</font>" >> version.html;
fi





