//used for the member picker dialog
angular.module("umbraco").controller("Umbraco.Dialogs.MemberPickerController",
    function($scope, eventsService, searchService, $log) {
        var dialogOptions = $scope.$parent.dialogOptions;
        $scope.dialogTreeEventHandler = $({});
        $scope.results = [];

        /** Method used for selecting a node */
        function select(text, id, entity) {

            $scope.showSearch = false;
            $scope.results = [];
            $scope.term = "";
            $scope.oldTerm = undefined;

            if (dialogOptions.multiPicker) {
                $scope.select(id);
            }
            else {
                //if an entity has been passed in, use it
                if (entity) {
                    $scope.submit(entity);
                }
                else {
                    //otherwise we have to get it from the server
                    entityResource.getById(id, "Member").then(function (ent) {
                        $scope.submit(ent);
                    });
                }
            }
        }

        $scope.performSearch = function() {
            if ($scope.term) {
                if ($scope.oldTerm !== $scope.term) {
                    $scope.results = [];
                    searchService.searchMembers({ term: $scope.term }).then(function(data) {
                        $scope.results = data;
                    });
                    $scope.showSearch = true;
                    $scope.oldTerm = $scope.term;
                }
            }
            else {
                $scope.oldTerm = "";
                $scope.showSearch = false;
                $scope.results = [];
            }
        };

        /** method to select a search result */
        $scope.selectResult = function(result) {
            //since result = an entity, we'll pass it in so we don't have to go back to the server
            select(result.name, result.id, result);
        };

        $scope.dialogTreeEventHandler.bind("treeNodeSelect", function(ev, args) {
            args.event.preventDefault();
            args.event.stopPropagation();

            if (args.node.nodeType === "member-folder") {
                return;
            }

            eventsService.publish("Umbraco.Dialogs.MemberPickerController.Select", args).then(function(a) {

                //This is a tree node, so we don't have an entity to pass in, it will need to be looked up
                //from the server in this method.
                select(a.node.name, a.node.id);

                if (dialogOptions && dialogOptions.multipicker) {

                    var c = $(a.event.target.parentElement);
                    if (!a.node.selected) {
                        a.node.selected = true;
                        c.find("i.umb-tree-icon").hide()
                            .after("<i class='icon umb-tree-icon sprTree icon-check blue temporary'></i>");
                    }
                    else {
                        a.node.selected = false;
                        c.find(".temporary").remove();
                        c.find("i.umb-tree-icon").show();
                    }
                }
            });

        });
    });