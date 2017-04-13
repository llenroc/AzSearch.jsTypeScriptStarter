import { Automagic } from "azsearch.js";

let automagic = new Automagic({
    index: "realestate-us-sample",
    queryKey: "D1CD08C7AC6A1886024E0F23B1824417",
    service: "azs-playground"
});
// Set some processors to format results for display
var suggestionsProcessor = (suggestions: any[]) => {
    return suggestions.map(function (suggestion) {
        suggestion.displayText = suggestion.number + " " + suggestion.street + " " + suggestion.city + ", " + suggestion.region + " " + suggestion.countryCode;
        suggestion.searchText = suggestion["@search.text"];
        return suggestion;
    });
};
var resultsProcessor = function (results: any[]) {
    return results.map(function (result) {
        result.displayText = result.number + " " + result.street + " " + result.city + ", " + result.region + " " + result.countryCode;
        var summary = result.description;
        result.summary = summary.length < 200 ? summary : summary.substring(0, 200) + "...";
        return result;
    });
};
automagic.store.setSuggestionsProcessor(suggestionsProcessor);
automagic.store.setResultsProcessor(resultsProcessor);

// Create some mustache templates to customize result/suggestion display. Default is JSON.stringify(result,null,4) rendered in <pre> and <code>.
var resultTemplate =
    `<div class="col-xs-12 col-sm-5 col-md-3 result_img">
            <img class="img-responsive result_img" src={{thumbnail}} alt="image not found" />
        </div>
        <div class="col-xs-12 col-sm-7 col-md-9">
            <h4>{{displayText}}</h4>
            <div class="resultDescription">
                {{{summary}}}
            </div>
            <div>
                sqft: <b>{{sqft}}</b>
            </div>
            <div>
                beds: <b>{{beds}}</b>
            </div>
            <div>
                baths: <b>{{baths}}</b>
            </div>
        </div>`;
var suggestionsTemplate = "{{displayText}} <br/> {{{searchText}}}";

// Add a search box that uses suggester "sg", grabbing some additional fields to display during suggestions. Use the template defined above
// when user selects a suggestion we'll insert "displayText" property into the searchBox
automagic.addSearchBox("searchBox",
    {
        highlightPreTag: "<b>",
        highlightPostTag: "</b>",
        suggesterName: "sg",
        select: "number,street,city,region,countryCode"
    },
    "displayText",
    suggestionsTemplate);
// add a results view using the template defined above
automagic.addResults("results", { count: true }, resultTemplate);
// Adds a pager control << 1 2 3 ... >>
automagic.addPager("pager");
// range facet for sqft
automagic.addRangeFacet("sqftFacet", "sqft", "number", 0, 17000);
// checkbox facet for numeric field beds
automagic.addCheckboxFacet("bedsFacet", "beds", "number");
// checkbox facet for numeric field baths
automagic.addCheckboxFacet("bathsFacet", "baths", "number");
// checkbox facet for string field type
automagic.addCheckboxFacet("typeFacet", "type", "string");
// checkbox facet for collection field tags
automagic.addCheckboxFacet("tagsFacet", "tags", "collection");

