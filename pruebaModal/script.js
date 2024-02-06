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
                
                cantantes += `<a onclick="searchAlbum('${cantante.id}');"><img src="${img}" width="75%"/></a>`;
                cantantes += `<h3> <a onclick="informacionCantante('${cantante.id}')"> ${nombre} </a></h3>`;
                cantantes += `<h5> Popularidad: ${popularidad} </h5>`
                
                cantantes += '</div>';
            })

            $('#artists div').html(cantantes);

            console.log(response);
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
                    // console.log(cantante.id);
                    cantantes += `<p onclick="informacionCantante('${cantante.id}')">`+ cantante['name']  + "</p><br>";
                })
                
                let popularidad = item['popularity'];
                let albumID = item['album']['id'];
                let albumImageUrl = item['album']['images'].length > 0 ? item['album']['images'][1]['url'] : './img/notFound.png';
    
                canciones += `<a onclick="searchTracks('${albumID}');"><img src="${albumImageUrl}" width="75%"/></a>`;
                canciones += `<a href="${item.album.external_urls.spotify}"><h3> ${titulo} </h3></a>`;
                canciones += `<h5> Popularidad: ${popularidad} </h5>` ;
                canciones += `<p> ${cantantes} </p>`;
                

                canciones += '</div>';
            })
            // console.log(response);
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

        document.getElementById('container').innerHTML += `<div id="album" class="modal"> </div>`;
        document.getElementById('container').innerHTML += `<div id="artista" class="modal"> </div>`;
    });



});

function searchTracks(id) {
    let spotify =  new Spotify();

    $.ajax({
        type: 'GET',
        url: spotify.apiUrl + 'v1/albums/' + id + '/tracks',
        headers: {
            'Authorization' : 'Bearer ' + access_token
        },
    }).done((response) => {
        console.log(response);

        let divAlbum = document.getElementById('album');
        divAlbum.innerHTML = null;

        response.items.forEach((item, index) => {
            // console.log();
            divAlbum.innerHTML += '<p>' + item.name + '<a href="'+ item.external_urls.spotify + '"> Play </a></p>';
            
        }); 
        
        $('#album').modal('show');
    });
    
}

function informacionCantante(id) {
    let spotify = new Spotify();

    $.ajax({
        type: 'GET',
        url: spotify.apiUrl + 'v1/artists/' + id,
        headers: {
            'Authorization' : 'Bearer ' + access_token
        },
    }).done((response) => {
        console.log(response);
        // <img src="" alt="" srcset="" />
        $('#artista').html( '<img src="' + response.images[0].url + '" width="100px"/>' +
                            '<p><strong> Name:</strong> ' + response.name + '</p>'+
                            '<p><strong> Number of followers:</strong> ' + response.followers.total + '</p>'+
                            '<p><strong> Popularity:</strong> ' + response.popularity + '</p>' +
                            '<p><strong> Genres:</strong> ' + response.genres + '</p>');

        $('#artista').modal('show');
    });

    
}

function searchAlbum(id) {
    let spotify = new Spotify();
    console.log(spotify);
    // let url = ;
    $.ajax({
        type: 'GET',
        url: spotify.apiUrl + `v1/artists/${id}/albums`,
        headers: {
            'Authorization' : 'Bearer ' + access_token
        }
    }).done((response) => {
        console.log(response);
        let albums = response.items;
        let albumsGuardados = "";
        albums.forEach((item, index) => {
            console.log(item);
            let tipoDeAlbum = item.album_type;
            let imagen = item.images[0].url;
            console.log(item);
            let artists;
            item.artists.forEach((artist, index) => {
                console.log(artist.name);
                if(index > 0) {
                    artists += ", " + `<a onclick="informacionCantante('${artist.id}')">` + artist.name + '</a>';
                } else if(index == 0){
                    artists = `<a onclick="informacionCantante('${artist.id}')">` + artist.name + '</a>';
                }
            })
            albumsGuardados += `<div style="margin-top: 10px; height: 100px;">
                                <div style="float: left">
                                    <a onclick="searchTracks(${item .id})"><img src="${imagen}" width="100px"></a>
                                </div>
                                <div style="width: 60%; float: left; margin-left: 5px;">
                                    <strong>Name: </strong> <a onclick="searchTracks(${item.id});">${item.name} </a><br>
                                    <strong>Artists: </strong> ${artists} <br>
                                    <strong>Album Type: </strong> ${tipoDeAlbum} <br>
                                    <strong>Release Date: </strong> ${item.release_date} 
                                </div ><br></div>`;
        })

        $('#album').html(albumsGuardados);
        $('#album a').css({
            'color': 'black',
            'margin-left': '0'
        });
        $('#album').modal('show');
    })
}