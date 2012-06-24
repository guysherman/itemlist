/**
 * itemList.js - Copyright (c) 2012 Guy Sherman
 *
 * Displays a list of items, much like a "List" in Trello (http://www.trello.com).
 *
 * Currently supports:
 *      - add/remove of items.
 *
 * Dependencies:
 *  -   Underscore, as var _
 *  -   jQuery, as var $
 *  -   Backbone, as var Backbone
 */

(function() {

    // save a reference to the global scope;
    var root = this;

    // In the spirit of not conflicting with other libraries, save any previous usage
    // of the variable we'd like to use. That way we can facilitate a "No Conflict" mode.
    var previousItemList = root.ItemList;

    // keep all the stuff we want to expose in a namespace;
    var ItemList = root.ItemList = {};

    ItemList.VERSION = '0.0.1';

    var _ = root._;
    var $ = root.jQuery;
    var Backbone = root.Backbone;

    if (!_) { throw "Underscore is not available!"; }
    if (!$) { throw "jQuery is not available!"; }
    if (!Backbone) { throw "Backbone is not available!"; }

    ItemList.noConflict = function() {
        root.ItemList = previousItemList;
        return this;
    };

    var ItemView = Backbone.View.extend({
        tagName: "div",
        className: "activity",
        model: {},
        initialize: function(options){
            this.model = options.model;
            this.template = options.template;
        },
        render: function(){
            var me = this;

            var viewModel = {
                title: this.model.get("title"),
                description: this.model.get("description")
            };

            var template = this.template;
            var compiledTemplate = _.template(template, viewModel)
            this.el.innerHTML = compiledTemplate;

            this.$(".icon-remove").click(function() {
                me.model.destroy();
            });
            this.$(".icon-remove").hide();

            this.$el.hover( function(event) {
                    me.$(".icon-remove").show();
                },
                function(event) {
                    me.$(".icon-remove").hide();
                });

            return this;
        }
    });

    // a function to return a new object which is a Backbone View
    // for an individual item.
    var createItemView = function(model, template) {
        return new ItemView({model: model, template: template});
    };

    var ListView = Backbone.View.extend({
        initialize: function(options){
            var me = this;
            _(this).bindAll("add", "remove");

            this.template = options.template;
            this.itemTemplate = options.itemTemplate;

            this.itemViews = [];

            this.collection.each(function(activity) {
                me.itemViews.push( createItemView(activity, this.itemTemplate ));
            });

            this.collection.bind("add", this.add);
            this.collection.bind("remove", this.remove);

        },

        add: function(item) {
            var me = this;

            // Create a new view
            var view = createItemView(item, this.itemTemplate);



            // Add it to the list
            this.itemViews.push(view);
            this.appendItem(view);


        },

        remove: function(item) {
            var me = this;

            // Find the view for the model
            var viewToRemove = _(this.itemViews).select( function(i) {
                return i.model === item;
            })[0];

            // remove it
            this.itemViews = _(this.itemViews).without(viewToRemove);

            $(viewToRemove.el).remove();

        },


        appendItem: function(item) {
            var me = this;
            var itemContainer = $(this.el).find(".items-container");
            itemContainer.append(item.render().el);

        },

        render: function(){
            var me = this;
            $(this.el).empty();

            // Spit out the template
            var listTitle = this.$el.attr("data-title");
            var compiledTemplate = _.template(this.template, { title: listTitle });
            this.el.innerHTML = compiledTemplate;

            // Fill it with items
            var itemContainer = $(this.el).find(".items-container");
            _(this.itemViews).each(function(item) {
                me.appendItem(item);
            });

            // Wire up the "Add Activity" text
            var addItem = this.$(".add-activity");
            addItem.click(function() {
                if ( me.newInputShowing !== true) {
                    var newInput = me.make("input", { "type":"text", "id":"newItemTitle", "class":"input-medium"});
                    $(newInput).keypress(function(event){
                        if ( event.which === 13 ) {
                    // TODO: Allow the user to pass a callback in here, so that they can create items in their code.
                            var inputText = $("#newItemTitle").val();
                            me.collection.create({ title: inputText, description: "", deadline: ""});
                            $(newItem).remove();
                            me.newInputShowing = false;
                        }

                    });

                    var cancel = me.make("i", {"class": "icon-remove cancel pull-right"});
                    $(cancel).click(function() {
                        $(newItem).remove();
                        me.newInputShowing = false;
                    });

                    var newItem = me.make("div", {"class" : "activity", id:"newActivity"});
                    $(newItem).append(newInput);
                    $(newItem).append(cancel);

                    itemContainer.append(newItem);
                    me.newInputShowing = true;
                }
            });

            this.rendered = true;
        }

    });

    var createListView = function(collection, template, itemTemplate, elementSelector) {
        return new ListView({collection: collection, template: template, itemTemplate: itemTemplate, el: elementSelector});
    };

    ItemList.itemList = function(template, itemTemplate, elementSelector) {

        var listUrl = $(elementSelector).attr("data-list-url");

        var collection = new (Backbone.Collection.extend({
            url: listUrl
        }));

        collection.fetch({
            success: function(data, response) {
                if (typeof(data) !== 'undefined') {
                    var view = createListView(data, template, itemTemplate, elementSelector);
                    view.render();
                }
            }
        });


    };






})();