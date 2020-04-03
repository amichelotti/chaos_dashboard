<table>
<thead>
<tr class="header">
<th>Andrea Michelotti Page 1 4/3/20</th>
<th></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td></td>
<td></td>
</tr>
<tr class="even">
<td></td>
<td></td>
</tr>
<tr class="odd">
<td></td>
<td></td>
</tr>
<tr class="even">
<td></td>
<td></td>
</tr>
<tr class="odd">
<td></td>
<td></td>
</tr>
</tbody>
</table>

Table of Contents
=================

[Getting Started 2](#getting-started)

[CU View 3](#cu-view)

[CU Context Menu 5](#cu-context-menu)

[Show/Set/Plot 7](#showsetplot)

[Tagging 11](#tagging)

[Show Tag Info 12](#show-tag-info)

[Retrive Zip History 13](#retrive-zip-history)

[Show description 14](#show-description)

[Take Snapshot 15](#take-snapshot)

[Management View 17](#management-view)

[Create an US 18](#create-an-us)

[Adding CU 19](#adding-cu)

[Copy/Move CU 20](#copymove-cu)

[US lifecycle 21](#us-lifecycle)

[US associated to agent 21](#us-associated-to-agent)

[US manually launched 22](#us-manually-launched)

[Associate a US to an Agent 22](#associate-a-us-to-an-agent)

[Dashboard Settings 25](#process-view)

[Configuration 25](#configuration)

[About 26](#about)

[Video Tutorials 27](#video-tutorials)

[Dashboard settings 27](#dashboard-settings-1)

Getting Started
===============

A web !CHAOS dashboard is associated to an installation of !CHAOS, at
the moment there are two installations:

1 – preproduction, used mainly for testing of things that are going to
production <http://chaost-hawebui.lnf.infn.it/>

2 – production used in production <http://chaos-hawebui.lnf.infn.it/>

i

CU View
=======

From this view its’ possible to monitor and control CU in a generic way.
The dashboard shows by default this view. On start the view is empty,
the user has to make its own selection through the *Zone*, *Group* or
*Custom search*. The information of the CU is given in a table view. The
columns are self-explanatory.

In the bottom of the CU view a generic control of the selected CU is
shown (Figure 2 Monitor & Control).

<img src="./media/image1.png" style="width:6.5in;height:4.93056in" alt="A picture containing screenshot Description automatically generated" />

Figure 1 Dashboard (CU view)

The CU view has two parts:

1.  Monitor table

2.  Generic control panel

In the monitor table the selected CU are shown with some parameter that
is shown, has for instance its state and uptime.

In the control panel its possible to give commands to one or more CU
that are selected.

**NOTE**: The ***Available commands*** is dynamically reconfigured in
base to the last CU selected.

<img src="./media/image2.png" style="width:6.5in;height:5.49306in" alt="A screenshot of a computer Description automatically generated" />

Figure 2 Monitor & Control

CU Context Menu
---------------

In addition to the explicit generic control panel, a **context menu** is
available once a CU is selected (yellow) shown in Figure 5 CU context
menu. In order to access to the context menu, you should select a CU by
clicking the mouse and then push the right button of the mouse.

<img src="./media/image3.png" style="width:6.5in;height:2.00069in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 3 CU context menu

The context menu allows easily to change status of one or more CUs (the
same operation can be done by the generic control panel), here below a
schema of the possible CU states:

<img src="./media/image4.png" style="width:6.375in;height:4.02422in" alt="A close up of a logo Description automatically generated" />

Figure 4 CU states and transitions

The status of a CU is reported in the *Status* column of the table view.

A CU can be in different states:

-   NOT LOADED

-   LOADED

-   INITIALIZED

-   RUNNING

-   STOPPED

-   NOT INITIALIZED

The diagram shows the possible CU states (uppercase labels) and their
representative icons. The arrows indicate the commands

Without going into details, suffice to say that – in order to be fully
operational – a CU must stay in the RUNNING state.

When a US starts, it puts all its CUs in a predefined state, as from its
configuration data.

### Show/Set/Plot 

Through this item of the context menu is possible to visualize, set and
plot CU dataset items.

<img src="./media/image5.png" style="width:6.5in;height:4.47014in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 5 Setting an input attribute

##### Set Attribute

In the figure above is shown how to set the *speed* input attribute of
the selected CU.

Set attribute actions:

1.  Select CU, RIGHT CLICK

2.  Select *Show/Set/Plot*

3.  Open *input* dataset

4.  Go on *speed,* LEFT CLICK,

5.  Write in the textbox the desired value

6.  ENTER

**NOTE:** Just attributes belonging to *input* dataset can be set.

**  
**

##### Plot *attribute*

The sequence to select the attribute is the same of Set Attribute, but
instead of LEFT CLICK on the attribute, do RIGHT CLICK to open the plot
menu.

Plot attribute actions:

1.  Select CU, RIGHT CLICK

2.  Select *Show/Set/Plot*

3.  Open *output* dataset

4.  Go on *speed,* RIGHT CLICK,

5.  On the plot menu select the plot type

ENTER

<img src="./media/image6.png" style="width:6.5in;height:4.36944in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 6 Plotting an attribute

In this example we’ll plot the *output* attribute *position* on Y.

Once selected a graph option dialog will open,

<img src="./media/image7.png" style="width:3.82308in;height:2.82156in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 6 Graph options

We are going to setup the graph options of our new graph, here you can
select the size of the graph, the type.

Continuing the setup we have to add the attribute that we want to plot,
the attribute that we have selected is ready to be inserted by clicking
on the **Add Trace.**

<img src="./media/image8.png" style="width:4.22308in;height:3.11678in" alt="A screenshot of a social media post Description automatically generated" />

Figure 8 Trace add

**NOTE:** An attribute name is fully identified by concatenation of the
CU path and the attribute name:
*&lt;ZONEPATH&gt;/&lt;GROUP&gt;/&lt;CUNAME&gt;/&lt;dataset
name&gt;/&lt;attribute name&gt;*

<img src="./media/image9.png" style="width:6.5in;height:4.47014in" alt="A screenshot of a cell phone Description automatically generated" />

<img src="./media/image10.png" style="width:3.16389in;height:1.82083in" />**NOTE:**
if the attribute is a vector it’s possible to select a particular
component by adding \[&lt;*index*&gt;\], if *index=-1* all component are
selected

To plot live or historical values, press **RUN.**

Saved graph can be recalled, from the *Graphs*

### Tagging

<img src="./media/image11.png" style="width:3.65556in;height:7.57222in" />

One or more CUs can be tagged for a given amount of time or for a number
of acquisition cycles. !CHAOS tag allows the dataset to be saved into a
permanent storage and identified with a given tag name.

Data that are tagged can be retrieved easily specifying the name of the
tag, and the system guaranties that those data are not swapped out by
ageing operations.

<img src="./media/image12.png" style="width:3.61826in;height:2.81884in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 9 Tag command

Actions:

1.  Select the CU to tag

2.  CLICK RIGHT and select **Tag for..**

3.  In the tag editor specify **tag name**

4.  Choose between TIME or CYCLE

5.  Specify a duration

6.  An optional description

7.  SAVE

The tagging operation starts once the SAVE has been pressed. *Figure*
*10 Tag editor*

In the *status* column will appear the icon of
<img src="./media/image13.png" style="width:0.25in;height:0.25in" />

<img src="./media/image15.png" style="width:6.5in;height:1.72569in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 11 Tagging in progress

### Show Tag Info

Through this option you can visualize information about the tags
associated to a particular CU.

<img src="./media/image16.png" style="width:4.53077in;height:4.7423in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 12 Tag info dialog

### Retrive Zip History

Through this function is possible to retrieve data corresponding to a
particular tag and or time interval, of a given CU. By selecting this
option from the context menu a query dialog will open.

<img src="./media/image17.png" style="width:2.78776in;height:1.24615in" alt="A screenshot of a cell phone Description automatically generated" />

<img src="./media/image18.png" style="width:6.5in;height:3.45347in" alt="A screenshot of a social media post Description automatically generated" />

Figure 12 Query Dialog

The main parameters to set up the query are the epoch timestamps (GMT),
that specify the interval of time we are interested of; *a time picker
widget* can be used to facilitate the setup of the correct interval. The
time picker has predefined time interval (Last 1h, Last 6h…) and the
possibility to define a custom interval ranges.

The user can specify also a tag from a combo box, and some more
technical parameters that can speedup the search such as the page size
and the chunk time in seconds.

Once you’ve setup the parameters you can run the query, and the result
will be displayed in a graph or returned as a JSON zip.

##### Retrive ROOT Zip History

This is a experimental option that allows to download data in CERN ROOT
format, currently this option opens a Figure 12 Query Dialog, and launch
a !CHAOS process (see ) that in background retrieves the required data
that can be accessed just after this process ends.

### Show description

Through this option you can access to the full description of the
selected CU, it gives for instance a detail information of the dataset,
types, commands…

<img src="./media/image19.png" style="width:4.03077in;height:4.36796in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 13 Description Dialog

### Take Snapshot

This function allows to save the setpoint of a selected group of CUs and
associate a name.

<img src="./media/image20.png" style="width:6.5in;height:2.48056in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 15 Take Snapshot dialog

A previously saved snapshot can be restored, through the menu always
present in the top right of the web page.

<img src="./media/image21.png" style="width:3.07749in;height:1.37708in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 16 Access to the Snapshot Menu

The snapshot menu, will show the snapshots associated to the selected CU
or all the snapshots if no CU is selected.

<img src="./media/image22.png" style="width:4.42996in;height:2.58462in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 17 Snapshot Menu

The snapshot menu shows the CUs that belongs to a given snapshot.

From this dialog is possible to:

**Show:** the dataset that is going to be restored,

**Apply**: the snapshot

**Delete:** the snapshot

**Upload:** a previously saved snapshot

**Save:** the snapshot locally on disk

Management View
===============

From this view it’s possible to monitor, manage and control life cycle
of !CHAOS nodes.

All the operations can be performed just after having selected some
!CHAOS nodes, the two combo on top of the page allows to select the type
and the name of the !CHAOS node. The possible types are:\\

1.  **US** (Unit Server), that are container of CU (Control Units)

2.  **CU**(Control Unit), that are the node that abstract the control of
    some HW or virtual device.

3.  **Agent**, that are the CHAOS nodes that allows to launch US,
    ExecutionUnit processes

4.  **Webui**, that are the !CHAOS nodes that provide REST services
    (i.e. for the dashboards)

5.  **MDS**/CDS, that are the !CHAOS nodes that provide !CHAOS node
    management, Live and History services

Once a type is selected (2) it’s possible to filter by name and by
activity (3) (just live nodes or all nodes), a list of nodes with some
other information should be displayed as a table.

By clicking RIGHT mouse on one or more node (4) it’s possible to access
to the **context menu** that will show the possible operation on the
selected node (5).

Common operations are typically **Start**, **Stop** or **Kill**.

<img src="./media/image23.png" style="width:6.32608in;height:3.03125in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 18 Management View

In the following paragraphs will be described the most common
procedures.

Create an US
------------

WE remind that an UnitServer is a container of Control Units/Execution
Units. Create an US is essentially a creation of a container and a list
of CU that it manages.

To create an empty US we need just to RIGHT CLICK on the table and
choose **New US..**

<img src="./media/image24.png" style="width:2.80122in;height:2.74615in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 19 New US

An **US Editor**, will be open,

<img src="./media/image25.png" style="width:3.50769in;height:3.1172in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 20 US Editor

We need to provide an **unique** name that will identify the newly
created US. At this point we can just **save generating an empty US, or
we can upload an US configuration previously written on disk. This is
the preferred way when you want to import a US from one infrastructure
(i.e. test) to another (i.e. production).**

### Adding CU

To fill an empty US we can proceed in 3 ways:

1.  Add a CU from an existing local configuration

2.  Add a CU from a template

3.  Copy/Move an existing CU into the new US

For the first two we just have to select the new US and use the
**context menu**.

<img src="./media/image26.png" style="width:4.42016in;height:3.00769in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 21 Add a CU from menu

The third method, is strongly suggested if the device has similar
initializations, drivers; envision the use of the context menu specific
for the CU **Node Type**, that explicitly has a copy/move function.

### Copy/Move CU

To copy or move a CU to a specific US we should:

1.  Select **cu** in **Node Type**

2.  Select **Search All**

3.  Optional set the name or simply press **ENTER**

4.  Select the CU to move/copy

5.  <img src="./media/image27.png" style="width:2.80833in;height:6.27639in" />RIGHT
    click -&gt; Copy CU

6.  Select **us** in **Node Type**

7.  Select the target US

8.  Paste/Move

9.  Choose if move or copy

<img src="./media/image28.png" style="width:3.34615in;height:2.26759in" alt="A screenshot of a cell phone Description automatically generated" /><img src="./media/image29.png" style="width:2.19396in;height:1.08739in" alt="A screenshot of a cell phone Description automatically generated" />

After choosing the **CU Editor** will be open to modify name and
optionally any other parameter.

Figure 22 CU Editor

US lifecycle 
------------

We should distinguish between:

1.  US that are associated to a !CHAOS agents

2.  US that are not associated and are started manually.

In the first case, the life cycle and debug is simpler, because we can
handle full lifecycle from the dashboard through the agent (start, stop,
kill and console).

**NOTE**: the last column (*parent*) tells which is the agent node that
controls the US.

### US associated to agent

To start a US that is **not activ**e, we should:

1.  Select **us** in **Node Type**

2.  Select **Search All**

3.  Optional set the name or simply press **ENTER**

4.  Select the US

5.  RIGHT click -&gt; Start US..

<img src="./media/image30.png" style="width:6.5in;height:3.29722in" alt="A screenshot of a social media post Description automatically generated" />

Figure 19 Starting a US associated to Agent

Here in the figure above a we are going to start a US named
**FLAME\_TRL.**

To stop a US that is **activ**e, we should:

1.  Select **us** in **Node Type**

2.  Select **Search Alive**

3.  Optional set the name or simply press **ENTER**

4.  Select the US

5.  RIGHT click -&gt; Stop US.. or Kill Us.. or Shutdown

**NOTE:** Kill a US will kill all the CU the are contained as well

**NOTE:** Sometime the agent cannot kill in a ordered way the US, in
this case the **Shutdown** option must be selected, it performs a brute
force kill, that avoid also a clean response by the US, so the result of
the operations is often reported as *failed*, even if the kill operation
*succeed*.

**NOTE:** in rare cases (i.e. driver blocked in IO) even the
**shutdown** operation is not able to kill the process, in these cases
an intervention of the system administrator of the machine that runs the
US is required.

### US manually launched

In this case it’s not possible to fully control the lifecycle, the
dashboard can just try to stop the **US** performing a **shutdown**
operation.

**NOTE:** these US don’t have the *parent column* set.

### Associate a US to an Agent

The easiest way to create an association is:

1.  select the US to associate

2.  RIGHT click accetto to the context menu and choose **Copy**.

<img src="./media/image31.png" style="width:2.8in;height:2.75333in" alt="A screenshot of a cell phone Description automatically generated" />

Figure 20 Copying a US

1.  change **Node Type** to agent

2.  select the destination agent

3.  RIGHT click-&gt;Associate &lt;name of copied the US&gt;

<img src="./media/image32.png" style="width:4.08403in;height:3.0748in" alt="A screenshot of a cell phone Description automatically generated" />

<img src="./media/image33.png" style="width:2.72153in;height:3.74583in" />Figure
21 Associate US

This point an **agent editor** will open, allowing to setup additional
parameters to the start of the associated US.

Figure 22 Agent Editor

Process View
============

This view is mainly used to lunch, monitor and manage CHAOS processes.
In the top of the page are shown an array of graphs that monitor the
load of the available !CHAOS nodes that can host the execution of a new
script, process or application. In the process table are also shown the
US that are launched and managed by !CHAOS agents.

Figure 27 Process Table

<img src="./media/image34.png" style="width:2.26474in;height:1.83534in" />By
RIGHT clicking in the blu area (in the red rectangle), you can access to
the context menu for launching and managing script.

<img src="./media/image35.png" style="width:4.68056in;height:2.43681in" />By
selecting a process you can access the context menu of the process.

ChaosShell View
===============

The chaos shell view offer the user the possibility to access !CHAOS
resources, through a web console, that accepts javascript. This web
console loads the *jchaos.js* library (the same used by the dashboard
itself), that allows to access !CHAOS resources.

The primary to use is to test and debug, or run control scripts on the
client side.

<img src="./media/image36.png" style="width:7.38541in;height:3.67692in" alt="A screenshot of a cell phone Description automatically generated" />

From this view is also possible load and execute file from you local
disk.

**NOTE**: scripts may be also launched directly into infrastructure
through the Process View

[Jchaos.js library](https://baltig.infn.it/chaos-lnf-control/jchaos)

Configuration View
==================

Dashboard Settings
==================

Configuration
-------------

Through *Settings-&gt;Config* you can set some useful parameters like
the default refresh rate of the !CHAOS nodes or the elements shown per
page.

<img src="./media/image37.png" style="width:2.41566in;height:2.46724in" alt="A screenshot of a cell phone Description automatically generated" />

By selecting *Config..* a editor will open showing the parameters that
can be edited.

<img src="./media/image38.png" style="width:2.41557in;height:3.25301in" alt="A screenshot of a cell phone Description automatically generated" />

NOTE: these values will be saved into the cache of the browser so these
parameters will be permanent until a clear cache is performed.

About
-----

Through *Setting-&gt;About..* you can access to the info of the most
important !CHAOS services: *mds, webui, agent*.

For instantce a system administrator through this panel can check the
build information of the different services.

<img src="./media/image39.png" style="width:4.08829in;height:4.01205in" alt="A screenshot of a cell phone Description automatically generated" />

<img src="./media/image40.png" style="width:6.5in;height:4.09306in" />Video Tutorials
=====================================================================================

Dashboard settings
------------------
