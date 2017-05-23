import { Automagic } from "azsearch.js";
import * as numeral from "numeral";

var automagic = new Automagic({ index: "realestate-us-sample", queryKey: "D1CD08C7AC6A1886024E0F23B1824417", service: "azs-playground" });
// Set some processors to format results for display
var suggestionsProcessor = (suggestions: any[]) => {
    return suggestions.map(function (suggestion) {
        suggestion.displayText = suggestion.number + " " + suggestion.street + " " + suggestion.city + ", " + suggestion.region + " " + suggestion.countryCode;
        suggestion.searchText = suggestion["@search.text"];
        return suggestion;
    });
};
var resultsProcessor = (results: any[]) => {
    return results.map(function (result) {
        result.displayText = result.number + " " + result.street + " " + result.city + ", " + result.region + " " + result.countryCode;
        var summary = result.description;
        result.summary = summary.length < 200 ? summary : summary.substring(0, 200) + "...";
        result.sqft = numeral(result.sqft).format("0,0");
        result.price = numeral(result.price).format("$0,0");
        return result;
    });
};
automagic.store.setSuggestionsProcessor(suggestionsProcessor);
automagic.store.setResultsProcessor(resultsProcessor);

// Create some mustache templates to customize result/suggestion display. Default is JSON.stringify(result,null,4) rendered in <pre> and <code>.
var resultTemplate =
    `<div class="col-xs-12 col-sm-3 col-md-3 result_img">
            <img class="img-responsive result_img" src={{thumbnail}} alt="image not found" />
        </div>
        <div class="col-xs-12 col-sm-9 col-md-9">
            <h4>{{displayText}}</h4>
            <div class="resultDescription">
                {{{summary}}}
            </div>
            <ul class="resultProperties">
                <li class="resultProperties__money"><i class="fa fa-money" aria-hidden="true"></i><span>{{price}}</span></li>
                <li class="resultProperties__home"><i class="fa fa-home" aria-hidden="true"></i><span>{{sqft}}ft<sup>2</sup></span></li>
                <li class="resultProperties__bed"><i class="fa fa-bed" aria-hidden="true"></i><span>{{beds}}</span></li>
                <li class="resultProperties__bath"><i class="fa fa-bath" aria-hidden="true"></i><span>{{baths}}</span></li>
            </ul>
        </div>`;
var suggestionsTemplate = "{{displayText}} <br/> {{{searchText}}}";

// Add a search box that uses suggester "sg", grabbing some additional fields to display during suggestions. Use the template defined above
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
// Add a loading indicator above the results view
automagic.addLoadingIndicator("loading");
// Adds a pager control << 1 2 3 ... >>
automagic.addPager("pager");
// range facet for price
automagic.addRangeFacet("priceFacet", "price", "number", 0, 2000000);
// range facet for sqft
automagic.addRangeFacet("sqftFacet", "sqft", "number", 0, 17000);
// checkbox facet for numeric field beds
automagic.addCheckboxFacet("bedsFacet", "beds", "number");
// checkbox facet for numeric field baths
automagic.addCheckboxFacet("bathsFacet", "baths", "number");
// checkbox facet for collection field tags
automagic.addCheckboxFacet("tagsFacet", "tags", "collection");
// filter header & footer options 
automagic.addClearFiltersButton("facetHeader");
automagic.addClearFiltersButton("facetFooter");
// add sorting options
var fields: { displayName: string, fieldName: string, latitude?: number, longitude?: number }[] = [
    { displayName: "Relevance", fieldName: "" },
    { displayName: "Price", fieldName: "price" },
    { displayName: "Size", fieldName: "sqft" },
    { displayName: "Beds", fieldName: "beds" },
    { displayName: "Baths", fieldName: "baths" }
];

// ask for users location and add a geo sorting option
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        fields.push({
            displayName: "Distance",
            fieldName: "location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
        automagic.addSortBy("sortBy", fields, "beds");
    },
        function () {
            // on rejection from user
            automagic.addSortBy("sortBy", fields, "beds");
        });
} else {
    automagic.addSortBy("sortBy", fields, "beds");
}
// static filter for home type
var filters = [
    { displayName: "Any", filter: "" },
    { displayName: "House", filter: "type eq 'House'" },
    { displayName: "Apartment", filter: "type eq 'Apartment'" }
];
var defaultFilter = "";
var title = "Home Type";
automagic.addStaticFilter("typeFilter", "type", filters, defaultFilter, title);
