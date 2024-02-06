const client_id = 'c380ca2aae99456caeb783fc3e7b2e5c';
const client_secret = 'd765b80c5b3e4b2096e39f676ebb9cc6';
let access_token;

let jsonAutor;
let jsonTrack;

//Funcion Spotify
function Spotify() {
    this.apiUrl = "https://api.spotify.com/";
}


Spotify.prototype.getArtistOrSong = function (artist, type) {
    console.log(artist);
    if(type == 'artist') {   // Buscar de artista
        $.ajax({   
        type: 'GET',
        url: this.apiUrl + 'v1/search?type='+ type + '&q=' + artist,
        headers: {
            'Authorization' : 'Bearer ' + access_token
        },
        }).done(function(response) {
            jsonAutor = JSON.stringify(response);
            let autores = response['artists']['items'];
            let cantantes = "";
            autores.forEach((cantante, index) => {
                cantantes += '<div id="cantantes">';
                
                let img = cantante['images'].length > 0 ? cantante['images'][1]['url'] : './img/notFound.png';
                let nombre = cantante['name'];
                let popularidad = cantante['popularity'];
                
                cantantes += `<img src="${img}" width="75%"/>`;
                cantantes += `<h3> ${nombre} </h3>`;
                cantantes += `<h5> Popularidad: ${popularidad} </h5>`
                
                cantantes += '</div>';
            })

            $('#artists div').html(cantantes);

            // console.log(response);
        });


    } else {  // Buscar por track
        $.ajax({
            type: 'GET',
            url: this.apiUrl + 'v1/search?q=' + artist + '&type=' + type,
            headers: {
                'Authorization' : 'Bearer ' + access_token
            },
        }).done(function(response) {
            jsonTrack = JSON.stringify(response);
            let canciones = "";

            response['tracks']['items'].forEach((item, index) => {
                // console.log(item);
                canciones += '<div id="cantantes"> ';  
                let titulo = item['name'];
                let cantantes = "";
                item['artists'].forEach((cantante, index) => {
                    cantantes += cantante['name']  + "<br>";
                })
                
                let popularidad = item['popularity'];
                // console.log(popularidad);
                
                let albumImageUrl = item['album']['images'].length > 0 ? item['album']['images'][1]['url'] : './img/notFound.png';
                // let albumImageUrl = item['album']['images'][1]['url'] ?? './img/notFound.png';
                // console.log(albumImageUrl);
                
                canciones += `<img src="${albumImageUrl}" width="75%"/>`;
                canciones += `<h3> ${titulo} </h3>`;
                canciones += `<h5> Popularidad: ${popularidad} </h5>` 
                canciones += `<p> ${cantantes} </p>`;

                canciones += '</div>';
            })
            console.log(response);
            $('#songs div').html(canciones);
   
        });

    }
}

//Justo se carge se realizara, es como un onload()
$(function () {

    $.ajax({
        type: "POST",
        url: 'https://accounts.spotify.com/api/token',
        beforeSend: function (http) {  //Conseguir el access_token
            http.setRequestHeader('Authorization', "Basic " + btoa(client_id + ":" + client_secret));  //Lo pasamos a 64 bit
        },
        dataType: "json", 
        data: { grant_type: "client_credentials" }  //From OAuth
    }).done(function(response) {
        access_token = response.access_token;
        console.log(access_token);
    });

    let spotify =  new Spotify();
    console.log(spotify);

    $('#btnSearch').on('click', ()=> {
        spotify.getArtistOrSong($('#inputSearch').val(), 'artist');
        spotify.getArtistOrSong($('#inputSearch').val(), 'track');

    });



});