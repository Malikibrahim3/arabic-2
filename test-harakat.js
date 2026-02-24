const fs = require('fs');
function stripHarakat(text) {
    return text.replace(/[\u064B-\u0652\u0654-\u0655]/g, '');
}
console.log("School raw:", "مَدْرَسَة");
console.log("School stripped:", stripHarakat("مَدْرَسَة"));
console.log("School length:", stripHarakat("مَدْرَسَة").length);
