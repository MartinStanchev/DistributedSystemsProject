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
    //  to get the repo url for the uml page
    getRepo: function() {
      window.location.href = "/uml.html?repo=" + repo;
    },
    // to get the repo url for interactive force page
    getRepoUml: function() {
      window.location.href = "/NewUml.html?repo=" + repo;
    },
    //  to get the url for the homePage(profile page)
    homePage: function() {
      const query = window.location.search.substring(1);
      const token = query.split("access_token=")[1];
      window.location.href = "/profile.html?access_token=" + token;
    },

    // get the data from backend ,creates nodes data and links data
    getUmlData: function() {
      console.log("getuml");
      axios
        .get("api/diagrams/" + repo)
        .then(response => {
          this.nodedata = response.data.data;
          if (response.data.data.length > 0) {
            // if we get response,fill it with all comments from our endpoints
            for (var t = 0; t < response.data.data[0].comments.length; t++) {
              this.comments.push(response.data.data[0].comments[t]);
            }

            // if we get the response from the data base and ,loop through its length and creates node data (classes)
            //loop through Classes length and define the names and classes infromation
            for (var j = 0; j < response.data.data.length; j++) {
              for (var i = 0; i < response.data.data[j].Classes.length; i++) {
                myDiagram.model.addNodeData(response.data.data[j].Classes[i]);
              }
            }

            // defines conecteds classes base on the the relationships in the classConecteds array
            for (var a = 0; a < response.data.data.length; a++) {
              for (
                var b = 0;
                b < response.data.data[a].classConecteds.length;
                b++
              ) {
                if (
                  response.data.data[a].classConecteds[b].relationship !== ""
                ) {
                  myDiagram.model.addLinkData(
                    response.data.data[a].classConecteds[b]
                  );
                }
              }
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    // save the change when we update the classes,save the name of the classes and thier relationships
    saveChange: function(e) {
      if(myDiagram.model.nodeDataArray.length != 0 || myDiagram.model.linkDataArray.length != 0) {
      axios
        .patch("/api/diagram/" + repo, {
          Classes: myDiagram.model.nodeDataArray,
          classConecteds: myDiagram.model.linkDataArray
        })
        .then(response => {
          console.log("data is succefuly updated " + response.status);
        })
        .catch(err => {
          window.alert("Sorry! You dont have authorization to make changes.");
          console.log(err);
        });
      } else {
        //window.alert("Don't spam save change!!!!!!!!");
        window.location.reload();
      }
    },
    // get the user repo information to fetch it on the comment
    queryGitUser: function() {
      const query = window.location.search.substring(1);
      const token = query.split("access_token=")[1];
      fetch("https://api.github.com/user", {
        headers: {
          Authorization: "token " + token
        }
      })
        .then(res => res.json())
        .then(res => {
          this.user = res;
        });
    },

    // add comment to the diagram by the rpeo url
    addComment: function() {
      //   defines the comment
      let co = {
        userName: this.user.login,
        comment: this.comment_diagram,
        userImage: this.user.avatar_url
      };
      // find the diagram by the repo url then update digram by adding the new comment(co)
      axios
        .patch("/api/diagram/add/" + repo, co)
        .then(response => {
          location.reload();
          console.log(response);
        })
        .catch(error => {
          window.alert("Sorry! You dont have authorization to add a comment.");
          console.log(error);
        });
    },
    // this function initialize the class diagram graphical components
    init: function() {
      console.log("init");
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
    },

    refreshDiagram: function() {
      myDiagram.clear();
      this.getUmlData();
    },

    connectSocket: function() {
      var socket = io();
      socket.on("updateDiagram", this.refreshDiagram);
    }
  },
  // This basically means that once Vue is ready, we call getUmlData()+queryGitUser()+init() to fetch
  mounted() {
    this.connectSocket();
    waitingDialog.show("Loading", {
      dialogSize: "sm",
      progressType: "warning"
    });

    this.getUmlData();
    this.queryGitUser();
    this.init();

    setTimeout(function() {
      if (
        myDiagram.model.nodeDataArray.length == 0 &&
        myDiagram.model.linkDataArray.length == 0
      ) {
      } else {
        waitingDialog.hide();
      }
    }, 1000);
    setTimeout(function() {
      if (
        myDiagram.model.nodeDataArray.length == 0 &&
        myDiagram.model.linkDataArray.length == 0
      ) {
        console.log("getuml");
        axios
          .get("api/diagrams/" + repo)
          .then(response => {
            this.nodedata = response.data.data;
            if (response.data.data.length > 0) {
              // if we get response,fill it with all comments from our endpoints
              for (var t = 0; t < response.data.data[0].comments.length; t++) {
                this.comments.push(response.data.data[0].comments[t]);
              }

              // if we get the response from the data base and ,loop through its length and creates node data (classes)
              //loop through Classes length and define the names and classes infromation
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

              // if we get the response from the data base ,defines conecteds classes base on the the relationships in the classConecteds array
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
      } else {
        waitingDialog.hide();
      }
    }, 2000);
    setTimeout(function() {
      if (
        myDiagram.model.nodeDataArray.length == 0 &&
        myDiagram.model.linkDataArray.length == 0
      ) {
      } else {
        waitingDialog.hide();
      }
    }, 3000);
    setTimeout(function() {
      if (
        myDiagram.model.nodeDataArray.length == 0 &&
        myDiagram.model.linkDataArray.length == 0
      ) {
      } else {
        waitingDialog.hide();
      }
    }, 4000);
    setTimeout(function() {
      if (
        myDiagram.model.nodeDataArray.length == 0 &&
        myDiagram.model.linkDataArray.length == 0
      ) {
        console.log("getuml");
        axios
          .get("api/diagrams/" + repo)
          .then(response => {
            this.nodedata = response.data.data;
            if (response.data.data.length > 0) {
              for (var t = 0; t < response.data.data[0].comments.length; t++) {
                this.comments.push(response.data.data[0].comments[t]);
              }

              // if we get the response from the data base and ,loop through its length and creates node data (classes)
              //loop through Classes length and define the names and classes infromation
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

              // if we get the response from the data base ,defines conecteds classes base on the the relationships in the classConecteds array
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
      } else {
        waitingDialog.hide();
      }
    }, 5000);
    setTimeout(function() {
      if (
        myDiagram.model.nodeDataArray.length == 0 &&
        myDiagram.model.linkDataArray.length == 0
      ) {
        console.log("getuml");
        axios
          .get("api/diagrams/" + repo)
          .then(response => {
            this.nodedata = response.data.data;
            if (response.data.data.length > 0) {
              // if we get response,fill it with all comments from our endpoints
              for (var t = 0; t < response.data.data[0].comments.length; t++) {
                this.comments.push(response.data.data[0].comments[t]);
              }

              // if we get the response from the data base and ,loop through its length and creates node data (classes)
              // loop through Classes length and define the names and classes infromation
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

              // if we get the response from the data base ,defines conecteds classes base on the the relationships in the classConecteds array
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
      } else {
        waitingDialog.hide();
      }
    }, 6000);
    setTimeout(function() {
      if (
        myDiagram.model.nodeDataArray.length == 0 &&
        myDiagram.model.linkDataArray.length == 0
      ) {
        window.alert(
          "Please refresh the page after 20 seconds. And make sure all the databases are activate!"
        );
        axios
        .get("api/nmap")
        .catch(error => {
          console.log(error);
        });
        waitingDialog.hide();
      }
    }, 7000);
  }
});
