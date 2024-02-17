const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');

module.exports = {
    dynamicSearchMessage: function (data, start, dataTotalCount, options, searchCategory, searchTerm) {
        var messages = [];
        var end = (dataTotalCount - start > GLOBAL.SEARCH.MAX_PAGE_SIZE) ? start + GLOBAL.SEARCH.MAX_PAGE_SIZE : start + (dataTotalCount - start);

        //Information count
        if (dataTotalCount > 0) {
            messages.push({
                "message": {
                    "text": (start + 1) + "-" + end + " of " + dataTotalCount + " Products👇"
                }
            });

            //Create properties card
            messages.push({
                "message": {
                    "attachment": {
                        "payload": {
                            "elements": createSearchGallery(data, start, dataTotalCount),
                            "template_type": "generic"
                        },
                        "type": "template"
                    }
                }
            });
        } else {
            messages.push({
                "message": {
                    "text": "Sorry! Nothing found. Please refine your search."
                }
            });
        }

        //Send followup message
        messages.push({
            "message": {
                "text": "Discover more treasures in our diverse range of products! 🌟🛒🔍",
                "quick_replies": createSearchQuickReplies(options, searchCategory,searchTerm) // Adjust parameters as needed
            }
        });

        return messages;
    }
};

// Define the createSearchGallery function
function createSearchGallery(data, start, dataTotalCount) {
    var cards = [];
  
    data.forEach((item) => {
      var buttons = [];
  
      buttons.push({
        "title": GLOBAL.FLOW.GET_QUOTE.TEXT,
        "type": "postback",
        "payload": JSON.stringify({
          "actions": [
            {
              "action": "set_field_value",
              "field_name": "destination",
              "value": item._source["destination"]
            }, {
              "action": "set_field_value",
              "field_name": "no-of-days",
              "value": item._source["days"]
            }, {
              "action": "set_field_value",
              "field_name": "travel-budget",
              "value": GLOBAL.SEARCH.CURRENCY_SYMBOL + item._source["price"].toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 })
            }, {
              "action": "send_flow",
              "flow_id": GLOBAL.FLOW.GET_QUOTE.FLOW_ID //add to cart flow
            }
          ]
        })
      });
  
  
      buttons.push({
        "title": "📚Download Package",
        "type": "web_url",
        "url": item._source["info"]
      });
  
  
      if (item._source["gallery"] !== '-') {
        buttons.push({
          "title": "🖼️Gallery",
          "type": "web_url",
          "url": item._source["gallery"]
        });
      } else if (item._source["video"] !== '-') {
        buttons.push({
          "title": "🎞️Video",
          "type": "web_url",
          "url": item._source["video"]
        });
      }
  
      const noOfAdults = item._source["adults"] == 1 ? " per person" : " per couple";
      const addlInfo = item._source["add-info"] ?? "";
      const card = {
        "title": item._source["name"],
        "subtitle": "🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + item._source["price"].toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) + noOfAdults + "  📍" + item._source["destination"] + "\n" + addlInfo,
        "image_url": item._source["cover-image"],
        "buttons": buttons
      };
  
      cards.push(card);
    });
  
    //Last card as pagination
    if (dataTotalCount > (start + GLOBAL.SEARCH.MAX_PAGE_SIZE)) {
  
      var card = {
        "title": "Tap for more👇",
        "image_url": GLOBAL.FLOW.NEXT_PAGE_CARDS.IMAGE,
        "buttons": [{
          "title": GLOBAL.FLOW.NEXT_PAGE_CARDS.TEXT,
          "type": "postback",
          "payload": JSON.stringify({
            "actions": [
              {
                "action": "set_field_value",
                "field_name": "card-search-index",
                "value": start + GLOBAL.SEARCH.MAX_PAGE_SIZE
              }, {
                "action": "send_flow",
                "flow_id": GLOBAL.FLOW.NEXT_PAGE_CARDS.FLOW_ID
              }
            ]
          })
        }]
      };
  
      cards.push(card);
    }
  
    return cards;
}

function createSearchQuickReplies(options, searchCategory, searchTerm) {
    var quickReplies = [];
  
    options.forEach(function (element) {
      if (!element.includes("Go Back") && !element.includes("More Options") && !element.includes("Restart Search"))
        quickReplies.push(utils.createButtonOrQuickReply(
          "qr",
          element,
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "card-search-index", 0],
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "A1", element],
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "Q1", searchCategory],
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "T1", searchTerm],
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1688916910534"]
        )
        );
    });
  
    quickReplies.push({
      "content_type": "text",
      "title": GLOBAL.FLOW.QUICK_SEARCH.TEXT,
      "payload": JSON.stringify({
        "actions": [{
          "action": "send_flow",
          "flow_id": GLOBAL.FLOW.QUICK_SEARCH.FLOW_ID //Calling Search
        }]
      })
    });
  
    return quickReplies;
}
