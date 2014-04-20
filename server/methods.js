Meteor.methods({
  'html2jade': function (html, mcheck) { 
    
    Future = Meteor.require('fibers/future')
    Meteor.require('contextify')
    
    var html2jade = Meteor.require('html2jade')
    var fut = new Future()
    
    html2jade.convertHtml(html, {double: true, doNotEncode: true}, function (err, jade) {
      var hasHtmlTag = (html.indexOf('<html>') > -1) ? true : false,
          hasBodyTag = (html.indexOf('<body>') > -1) ? true : false
      
      if (mcheck) {
        
        var result = '',
            lines = jade.match(/[^\r\n]+/g),
            middleOfBlock = []
        
        _.each(lines, function (line){
          
          var newLine = new BlockLine(line)

          // Shift block spaces
          if (newLine.startBlock) {
            middleOfBlock.push('  ')
          } else if (newLine.endBlock) {
            middleOfBlock.pop()
          }
          
          if (newLine.startBlock || newLine.templateTag || newLine.elseBlock) {
            result += newLine.getNewBlockStartLine() + '\r\n'
          } else if (newLine.endBlock) {
            // remove end block & else tag lines
          } else if (!hasHtmlTag && newLine.line.replace(' ', '').indexOf('html') > -1){
            // remove html
          } else if (!hasBodyTag && newLine.line.replace(' ', '').indexOf('body') > -1){
            // remove body
          } else {
            
            if (middleOfBlock.length > 0) {
              // Buffer leading spaces within middle of blocks
              line = middleOfBlock.join('') + line
            }
            if (!hasHtmlTag && !hasBodyTag) {
              line = line.substring(4, line.length)
            }
            
            result += line  + '\r\n'         
          }       
        })
        fut.return(result)
      } else {
        fut.return(jade)
      } 
      
    })
    
    return fut.wait()
  }
})

function BlockLine(line){ 
  this.line = line
  this.openPos = line.indexOf('{{')
  this.closePos = line.indexOf('}}')
  
  this.startBlock = false
  this.endBlock = false  
  this.elseBlock = false

  if (line.indexOf('{{#') > -1) {
    var p1 = line.indexOf('#'),
        p2 = line.indexOf(' ', p1)
    this.blockTag = line.substring(p1+1, p2)
    this.startBlock  = true
    
  } else if (line.indexOf('{{/')  > -1) {
    var p1 = line.indexOf('/'),
        p2 = line.indexOf(' ', p1)
    this.blockTag = line.substring(p1+1, p2)
    this.endBlock = true
  } else if (line.indexOf('{{else}}')  > -1) {
    this.elseBlock = true
  } else if (line.indexOf('| {{&#62; ') > -1) {    
    this.templateTag = true
  }

}

BlockLine.prototype.getNewBlockStartLine = function(){
  var newLine = ''
  if (this.startBlock) {
    newLine = this.line
                    .replace('  | {{#', '')
                    .replace('}}','')
    
  } else if (this.templateTag) {
    newLine = this.line
                    .replace('| {{&#62; ', '+')
                    .replace('}}','')
  } else if (this.elseBlock){
    newLine = this.line
                    .replace('| {{','')
                    .replace('}}','')
  }
  return newLine
}