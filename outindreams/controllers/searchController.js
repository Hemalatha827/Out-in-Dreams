const GLOBAL = require('../GLOBAL_VARS.json');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const utilitieFunc = require('../utilities/utilitieFunc');
const searchservice = require('../service/search/searchDestinationService');
const searchDestinationService = require('../service/search/searchDestinationService');



exports.searchdestination = async (req, res) => {

   var  postData =req.body;

    var PAGE_START = Number(postData.start);
    let sortFields = [];
    postData["data"].forEach(function (e) {
      if (e.value !== '-') {
        if (e.query == "-" || e.query == "") {
          e.query = "destination";
          e.type = "term";
        }
        sortFields.push(e.query);
      }
    });


    const elasticData = await queryBuilderUtils.getElasticData(PAGE_START, GLOBAL.SEARCH.MAX_PAGE_SIZE, postData.data,GLOBAL.SERVER.ZS_PACKAGES_INDEX, [], sortFields);


    const data = elasticData.hits.hits;
    let dataTotalCount = Number(elasticData.hits.total.value);
  
    let options = [];
    if (postData["options"])
      options = JSON.parse(postData["options"]);
  
    let category = postData.data["query"];
    let type = postData.data["type"];
  
    if (options.length == 0) {
      options = [
        "\ud83c\uddf2\ud83c\uddfbMaldives",
        "\ud83c\uddee\ud83c\udde9Bali",
        "\ud83c\udde6\ud83c\uddeaDubai",
        "\ud83c\uddf9\ud83c\uddedThailand",
        "\ud83c\uddee\ud83c\uddf3Andaman",
        "\ud83c\uddee\ud83c\uddf3Manali",
        "\ud83c\uddee\ud83c\uddf3Kashmir",
        "\ud83c\uddee\ud83c\uddf3Kerala",
        "\ud83c\uddee\ud83c\uddf3Goa"
      ];
      category = "destination";
      type = "term";
    }

    
    let message = searchDestinationService.dynamicSearchMessage(data, PAGE_START, dataTotalCount, options, category, type);
  
    let dynamicContent = {
      "messages": message
    };
  
    res.json(dynamicContent)
};
