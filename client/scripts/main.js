// On page create
document.addEventListener('DOMContentLoaded', function () {

        // Load particles (particles div tag)
        if(document.getElementById('particles') !== null) {
          particleground(document.getElementById('particles'), {
            dotColor: '#fff',
            lineColor: '#fff'
          });
        }

        // Load intro (intro div tag)
        var intro = document.getElementById('intro');
        if(intro !== null) {
          intro.style.marginTop = - intro.offsetHeight / 2 + 'px';
        }
        


    }, false);
          