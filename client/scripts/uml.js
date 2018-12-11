var linkdata = [
  //{ from: -4, to: -5, relationship: "generalization" },
  // { from: 13, to: 11, relationship: "generalization" },
  // { from: 14, to: 13, relationship: "aggregation" }
];
var url_string = window.location.href;
var url = new URL(url_string);
var repo = url.searchParams.get("repo");
var app = new Vue({
  el: "#uml",
  data: {
    id: "",
    nodedata: [],
    di: [],
    Classes: [],
    SuperClass: "",
    classExtends: [],
    linkdata: [],
    comments: [],
	user: [],
    comment_diagram: ""
  },
  methods: {
    hideModal: function() {
      $("#myModal").removeClass("in");
      $(".modal-backdrop").remove();
      $("body").removeClass("modal-open");
      $("body").css("padding-right", "");
      $("#myModal").hide();
    },
    getUmlData: function() {
      axios
        .get("api/diagram/" + repo)
        .then(response => {
          this.nodedata = response.data.data;

          if (response.data.data.length > 0) {
            console.log("hide the wiating dialog");
            waitingDialog.hide();
            this.hideModal();

            for (var t = 0; t < response.data.data[0].comments.length; t++) {
              this.comments.push(response.data.data[0].comments[t]);
            }

            // get the response from the data base and loop through its length,
            for (var j = 0; j < response.data.data.length; j++) {
              for (var i = 0; i < response.data.data[j].Classes.length; i++) {
                var data = {
                  key: response.data.data[j].Classes[i].name,
                  name: response.data.data[j].Classes[i].name,
                  id: response.data.data[j].Classes[i]._id,
                  repoID: response.data.data[j]._id,
                  properties: response.data.data[j].Classes[i].properties
                };
                myDiagram.model.addNodeData(data);
              }
            }

            // defines conecteds classes
            for (var a = 0; a < response.data.data.length; a++) {
              for (
                var b = 0;
                b < response.data.data[a].classConecteds.length;
                b++
              ) {
                myDiagram.model.addLinkData(
                  response.data.data[a].classConecteds[b]
                );
              }
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    saveChange: function(e) {
      axios
        .patch("/api/diagram/" + repo, {
          Classes: myDiagram.model.nodeDataArray,
          classConecteds: myDiagram.model.linkDataArray
        })
        .then(response => {
          this.getUmlData();
          console.log("data is succefuly updated " + response.status);
        })
        .catch(err => {
          console.log(err);
        });
    },
	  queryGitUser: function () {
            const query = window.location.search.substring(1)
            const token = query.split('access_token=')[1]
            fetch('https://api.github.com/user', {
                headers: {
                    Authorization: 'token ' + token
                }
            }).then(res => res.json()).then(res => {
                this.user = res;
            })
        }, 
    addComment: function() {
      let co = {
        userName: this.user.login,
        comment: this.comment_diagram,
		userImage: this.user.avatar_url
      };
      axios
        .patch("/api/diagram/add/" + repo, co)
        .then(response => {
		  location.reload();
//		  this.getUmlData();
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
    },
	 

    // saveComment: function(e) {
    //   axios
    //     .patch("/api/diagram/Georgesarkis_assig6", {
    //       Classes: myDiagram.model.nodeDataArray,
    //       classConecteds: myDiagram.model.linkDataArray
    //     })
    //     .then(response => {
    //       console.log("data is succefuly updated " + response.status);
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });
    // },

    init: function() {
      var $ = go.GraphObject.make;
      myDiagram = $(go.Diagram, "myDiagramDiv", {
        initialContentAlignment: go.Spot.Center,
        "undoManager.isEnabled": true,
        layout: $(go.TreeLayout, {
          // this only lays out in trees nodes connected by "generalization" links
          angle: 90,
          path: go.TreeLayout.PathSource, // links go from child to parent
          setsPortSpot: false, // keep Spot.AllSides for link connection spot
          setsChildPortSpot: false, // keep Spot.AllSides
          // nodes not connected by "generalization" links are laid out horizontally
          arrangement: go.TreeLayout.ArrangementHorizontal
        })
      });
      // show visibility or access as a single character at the beginning of each property or method
      function convertVisibility(v) {
        switch (v) {
          case "public":
            return "+";
          case "private":
            return "-";
          case "protected":
            return "#";
          case "package":
            return "~";
          default:
            return v;
        }
      }
      // the item template for properties
      var propertyTemplate = $(
        go.Panel,
        "Horizontal",
        // property visibility/access
        $(
          go.TextBlock,
          { isMultiline: false, editable: false, width: 12 },
          new go.Binding("text", "visibility", convertVisibility)
        ),
        // property name, underlined if scope=="class" to indicate static property
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("isUnderline", "scope", function(s) {
            return s[0] === "c";
          })
        ),
        // property type, if known
        $(
          go.TextBlock,
          "",
          new go.Binding("text", "type", function(t) {
            return t ? ": " : "";
          })
        ),
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "type").makeTwoWay()
        ),
        // property default value, if any
        $(
          go.TextBlock,
          { isMultiline: false, editable: false },
          new go.Binding("text", "default", function(s) {
            return s ? " = " + s : "";
          })
        )
      );
      // the item template for methods
      var methodTemplate = $(
        go.Panel,
        "Horizontal",
        // method visibility/access
        $(
          go.TextBlock,
          { isMultiline: false, editable: false, width: 12 },
          new go.Binding("text", "visibility", convertVisibility)
        ),
        // method name, underlined if scope=="class" to indicate static method
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("isUnderline", "scope", function(s) {
            return s[0] === "c";
          })
        ),
        // method parameters
        $(
          go.TextBlock,
          "()",
          // this does not permit adding/editing/removing of parameters via inplace edits
          new go.Binding("text", "parameters", function(parr) {
            var s = "(";
            for (var i = 0; i < parr.length; i++) {
              var param = parr[i];
              if (i > 0) s += ", ";
              s += param.name + ": " + param.type;
            }
            return s + ")";
          })
        ),
        // method return type, if any
        $(
          go.TextBlock,
          "",
          new go.Binding("text", "type", function(t) {
            return t ? ": " : "";
          })
        ),
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "type").makeTwoWay()
        )
      );
      // this simple template does not have any buttons to permit adding or
      // removing properties or methods, but it could!
      myDiagram.nodeTemplate = $(
        go.Node,
        "Auto",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides
        },
        $(go.Shape, { fill: "lightyellow" }),
        $(
          go.Panel,
          "Table",
          { defaultRowSeparatorStroke: "black" },
          // header
          $(
            go.TextBlock,
            {
              row: 0,
              columnSpan: 2,
              margin: 3,
              alignment: go.Spot.Center,
              font: "bold 12pt sans-serif",
              isMultiline: false,
              editable: true
            },
            new go.Binding("text", "name").makeTwoWay()
          ),
          // properties
          $(
            go.TextBlock,
            "Properties",
            { row: 1, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", function(v) {
              return !v;
            }).ofObject("PROPERTIES")
          ),
          $(
            go.Panel,
            "Vertical",
            { name: "PROPERTIES" },
            new go.Binding("itemArray", "properties"),
            {
              row: 1,
              margin: 3,
              stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left,
              background: "lightyellow",
              itemTemplate: propertyTemplate
            }
          ),
          $(
            "PanelExpanderButton",
            "PROPERTIES",
            { row: 1, column: 1, alignment: go.Spot.TopRight, visible: false },
            new go.Binding("visible", "properties", function(arr) {
              return arr.length > 0;
            })
          ),
          // methods
          $(
            go.TextBlock,
            "Methods",
            { row: 2, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", function(v) {
              return !v;
            }).ofObject("METHODS")
          ),
          $(
            go.Panel,
            "Vertical",
            { name: "METHODS" },
            new go.Binding("itemArray", "methods"),
            {
              row: 2,
              margin: 3,
              stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left,
              background: "lightyellow",
              itemTemplate: methodTemplate
            }
          ),
          $(
            "PanelExpanderButton",
            "METHODS",
            { row: 2, column: 1, alignment: go.Spot.TopRight, visible: false },
            new go.Binding("visible", "methods", function(arr) {
              return arr.length > 0;
            })
          )
        )
      );
      function convertIsTreeLink(r) {
        return r === "generalization";
      }
      function convertFromArrow(r) {
        switch (r) {
          case "generalization":
            return "";
          default:
            return "";
        }
      }
      function convertToArrow(r) {
        switch (r) {
          case "generalization":
            return "Triangle";
          case "aggregation":
            return "StretchedDiamond";
          default:
            return "";
        }
      }
      myDiagram.linkTemplate = $(
        go.Link,
        { routing: go.Link.Orthogonal },
        new go.Binding("isLayoutPositioned", "relationship", convertIsTreeLink),
        $(go.Shape),
        $(
          go.Shape,
          { scale: 1.3, fill: "red" },
          new go.Binding("fromArrow", "relationship", convertFromArrow)
        ),
        $(
          go.Shape,
          { scale: 1.3, fill: "red" },
          new go.Binding("toArrow", "relationship", convertToArrow)
        )
      );
      myDiagram.model = $(go.GraphLinksModel, {
        copiesArrays: true,
        copiesArrayObjects: true,
        nodeDataArray: this.nodedata,
        linkDataArray: linkdata
      });
      // myDiagram.addModelChangedListener(function(e) {
      //   if (e.isTransactionFinished) {
      //     // Show the model data to the console after changing the diagram.
      //     // add the patch request to save the changes to database
      //     axios
      //       .patch("/api/diagram/" + repo, {
      //         Classes: e.model.nodeDataArray,
      //         classConecteds: e.model.linkDataArray
      //       })
      //       .then(response => {
      //         console.log("data is succefuly updated " + response.status);
      //       })
      //       .catch(err => {
      //         console.log(err);
      //       });
      //   }
      // });
    }
  },
	
  mounted() {
    waitingDialog.show("Loading", {
      dialogSize: "sm",
      progressType: "warning"
    });
    setTimeout(function() {
      waitingDialog.hide();
    }, 2000);
    //waitingDialog.show();
    setTimeout(this.getUmlData(), 0);
    //this.getUmlData();
	  this.queryGitUser();
    this.init();
  }
});
