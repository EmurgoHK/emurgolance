// we have to transform meteor.call methods to promises in order to work with Mocha

export const callWithPromise = function () {
    let method = arguments[0]
    let params = Array.from(arguments)
    params.shift()

    return new Promise((resolve, reject) => {
        Meteor.apply(method, params, (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

export const camelize = function (str) {
  if(str){
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
}
