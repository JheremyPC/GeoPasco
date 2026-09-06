// ======================================
// SIG-SERVICIOS
// Sistema de Información Geográfica
// ======================================


// ======================================
// VARIABLES
// ======================================

let map;
let markers = [];
let placeMarkers = [];
let placeResults = [];
let infoWindow;

let userLocationMarker = null;
let AdvancedMarkerElement;

let currentUserLocation = null;
let routePolylines = [];

let selectedPlace = null;

// ======================================
// DATOS DEL SISTEMA
// ======================================

const lugares = [

    {
        id: 1,
        nombre: "Centro de Salud - Ejemplo",
        categoria: "Salud",
        lat: -10.6857,
        lng: -76.2560,
        descripcion:
            "Punto de atención de salud de demostración."
    },

    {
        id: 2,
        nombre: "Institución Educativa - Ejemplo",
        categoria: "Educación",
        lat: -10.6870,
        lng: -76.2580,
        descripcion:
            "Institución educativa de demostración."
    },

    {
        id: 3,
        nombre: "Entidad Pública - Ejemplo",
        categoria: "Gobierno",
        lat: -10.6848,
        lng: -76.2550,
        descripcion:
            "Entidad gubernamental de demostración."
    },

    {
        id: 4,
        nombre: "Comisaría - Ejemplo",
        categoria: "Seguridad",
        lat: -10.6875,
        lng: -76.2545,
        descripcion:
            "Punto de seguridad de demostración."
    },

    {
        id: 5,
        nombre: "Establecimiento Comercial - Ejemplo",
        categoria: "Comercio",
        lat: -10.6838,
        lng: -76.2575,
        descripcion:
            "Establecimiento comercial de demostración."
    }

];


// ======================================
// INICIALIZAR MAPA
// ======================================

async function initMap() {

    console.log("Inicializando Google Maps...");


    // ----------------------------------
    // Cargar biblioteca MAPS
    // ----------------------------------

    const { Map, InfoWindow } =
        await google.maps.importLibrary("maps");


    // ----------------------------------
    // Cargar biblioteca MARKER
    // ----------------------------------

  const markerLibrary =
    await google.maps.importLibrary(
        "marker"
    );

AdvancedMarkerElement =
    markerLibrary.AdvancedMarkerElement;

    // ----------------------------------
    // Ubicación inicial
    // Cerro de Pasco
    // ----------------------------------

    const ubicacionInicial = {

        lat: -10.6864,

        lng: -76.2567

    };


    // ----------------------------------
    // Crear mapa
    // ----------------------------------

    map = new Map(
        document.getElementById("map"),
        {

            center: ubicacionInicial,

            zoom: 15,

            mapTypeControl: true,

            streetViewControl: true,

            fullscreenControl: true,

            mapId: "DEMO_MAP_ID"

        }
    );


    // ----------------------------------
    // Crear ventana
    // ----------------------------------

    infoWindow = new InfoWindow({
        maxWidth: 350
    });


    console.log(
        "Mapa creado correctamente."
    );


    // ==================================
    // CREAR MARCADORES
    // ==================================

    lugares.forEach(function(lugar) {


        const marker =
            new AdvancedMarkerElement({

                map: map,

                position: {

                    lat: lugar.lat,

                    lng: lugar.lng

                },

                title: lugar.nombre,

                gmpClickable: true

            });


        // Guardar datos
        marker.lugar = lugar;

           
        // --------------------------------
        // CLICK DEL MARCADOR
        // --------------------------------

        marker.addEventListener(
            "gmp-click",
            function() {


                mostrarInformacion(lugar);


                const contenido = `
                    <div style="
                        font-family: Arial;
                        min-width: 220px;
                        padding: 5px;
                    ">

                        <h3 style="
                            margin: 0 0 10px 0;
                        ">
                            ${lugar.nombre}
                        </h3>

                        <p style="
                            margin: 6px 0;
                        ">
                            <strong>Categoría:</strong>
                            ${lugar.categoria}
                        </p>

                        <p style="
                            margin: 8px 0;
                        ">
                            ${lugar.descripcion}
                        </p>

                        <p style="
                            margin: 8px 0;
                            font-size: 12px;
                        ">
                            <strong>Coordenadas:</strong><br>
                            ${lugar.lat},
                            ${lugar.lng}
                        </p>

                    </div>
                `;


                infoWindow.setContent(
                    contenido
                );


                infoWindow.open({

                    map: map,

                    anchor: marker,

                    shouldFocus: false

                });

            }
        );


        // Guardar marcador
        markers.push(marker);
            
    });


    console.log(
        markers.length +
        " marcadores creados."
    );

}


// ======================================
// HACER initMap GLOBAL
// ======================================

// Google Maps necesita poder encontrar
// esta función mediante callback=initMap.

window.initMap = initMap;


// ======================================
// ELEMENTOS HTML
// ======================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


const searchButton =
    document.getElementById(
        "searchButton"
    );


const placeCount =
    document.getElementById(
        "placeCount"
    );


const selectedName =
    document.getElementById(
        "selectedName"
    );


const selectedCategory =
    document.getElementById(
        "selectedCategory"
    );

const locationButton =
    document.getElementById(
        "locationButton"
    );
const systemStatus =
    document.getElementById(
        "systemStatus"
    );

// ======================================
// CONTADOR
// ======================================

placeCount.textContent =
    lugares.length;


// ======================================
// MOSTRAR INFORMACIÓN
// ======================================

function mostrarInformacion(lugar) {

    selectedName.textContent =
        lugar.nombre;


    selectedCategory.textContent =
        "Categoría: " +
        lugar.categoria;

}


// ======================================
// BUSCADOR LOCAL
// ======================================

searchButton.addEventListener(
    "click",
    buscarLugar
);


searchInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {

            buscarLugar();

        }

    }
);


async function buscarLugar(
    textoPersonalizado = null
) {

    const texto =
        (
            textoPersonalizado !== null
                ? textoPersonalizado
                : searchInput.value
        )
        .trim();

    if (texto === "") {

        alert(
            "Ingrese una ubicación para buscar."
        );

        return;

    }
    cambiarEstado(
    "⏳ Buscando lugares..."
);


    // ----------------------------------
    // Mostrar estado
    // ----------------------------------

    selectedName.textContent =
        "Buscando...";

    selectedCategory.textContent =
        "Consultando Google Places";


    try {
            // Ocultar marcadores propios
            // mientras mostramos resultados reales

            markers.forEach(
                function(marker) {

                    marker.map = null;

                }
            );
        // ==================================
        // CARGAR PLACES
        // ==================================

        const { Place } =
            await google.maps.importLibrary(
                "places"
            );


        // ==================================
        // CARGAR MARCADORES
        // ==================================

        const { AdvancedMarkerElement } =
            await google.maps.importLibrary(
                "marker"
            );


        // ==================================
        // ELIMINAR RESULTADOS ANTERIORES
        // ==================================

        placeMarkers.forEach(
            function(marker) {

                marker.map = null;

            }
        );


        placeMarkers = [];
        placeResults = [];

        limpiarResultados();
   
        // ==================================
        // CONSULTA
        // ==================================

        const consulta =
            texto +
            " en Cerro de Pasco, Pasco, Perú";


        console.log(
            "Consulta enviada a Google:",
            consulta
        );


        // ==================================
        // PETICIÓN A GOOGLE PLACES
        // ==================================

        const request = {

            textQuery: consulta,

            fields: [
                "displayName",
                "formattedAddress",
                "location",
                "id",
                "googleMapsURI",
                "primaryTypeDisplayName"
            ],

            locationBias:
                map.getCenter(),

            language: "es",

            region: "PE",

            maxResultCount: 8

        };


        const { places } =
            await Place.searchByText(
                request
            );


        // ==================================
        // SIN RESULTADOS
        // ==================================

        if (
            !places ||
            places.length === 0
        ) {
                    cambiarEstado(
            "⚠️ No se encontraron lugares"
        );

            selectedName.textContent =
                "Sin resultados";

            selectedCategory.textContent =
                "Google no encontró lugares relacionados.";

            return;

        }


        console.log(
            "Resultados encontrados:",
            places.length
        );
            cambiarEstado(
                `✅ ${places.length} lugares encontrados`
            );


        // ==================================
        // BOUNDS
        // ==================================

        const { LatLngBounds } =
            await google.maps.importLibrary(
                "core"
            );


        const bounds =
            new LatLngBounds();


        // ==================================
        // CREAR MARCADORES
        // ==================================

        places.forEach(
            function(place) {

                // Si Google no devuelve
                // coordenadas, no podemos
                // dibujar el marcador.

                if (!place.location) {

                    return;

                }
             


                const marker =
                    new AdvancedMarkerElement({

                        map: map,

                        position:
                            place.location,

                        title:
                            place.displayName,

                        gmpClickable: true

                    });


                // ==================================
                // CLICK EN RESULTADO
                // ==================================

                marker.addEventListener(
                    "gmp-click",
                    function() {

                        mostrarPlace(
                            place,
                            marker
                        );

                    }
                );


                // Guardar marcador

                placeMarkers.push(
                    marker
                );


                // Agregar al área visible

                bounds.extend(
                    place.location
                );

            }
        );
        mostrarResultados();

        placeCount.textContent =
            placeResults.length;

        // ==================================
        // AJUSTAR MAPA
        // ==================================

        if (
            placeMarkers.length > 0
        ) {

            map.fitBounds(
                bounds
            );

        }

    }

    catch (error) {

        console.error(
            "Error de Google Places:",
            error
        );
        cambiarEstado(
    "❌ Error al consultar lugares"
);


        selectedName.textContent =
            "Error en la búsqueda";


        selectedCategory.textContent =
            "Revisa la consola del navegador.";

    }

}

// ======================================
// MOSTRAR INFORMACIÓN DE UN PLACE
// ======================================

function mostrarPlace(place, marker) {

    // ==================================
    // GUARDAR LUGAR SELECCIONADO
    // ==================================

    selectedPlace = place;


    // ==================================
    // ACTUALIZAR PANEL IZQUIERDO
    // ==================================

    selectedName.textContent =
        place.displayName || "Lugar sin nombre";

    selectedCategory.textContent =
        place.primaryTypeDisplayName || "Lugar";


    // ==================================
    // CONTENEDOR PRINCIPAL DEL INFOWINDOW
    // ==================================

    const container =
        document.createElement("div");

    container.style.fontFamily = "Arial";
    container.style.minWidth = "250px";
    container.style.maxWidth = "300px";
    container.style.padding = "5px";


    // ==================================
    // NOMBRE DEL LUGAR
    // ==================================

    const title =
        document.createElement("h3");

    title.textContent =
        place.displayName || "Lugar sin nombre";

    title.style.margin =
        "0 0 10px 0";

    title.style.fontSize =
        "16px";

    container.appendChild(title);


    // ==================================
    // CATEGORÍA
    // ==================================

    if (place.primaryTypeDisplayName) {

        const category =
            document.createElement("p");

        category.style.margin =
            "6px 0";

        category.style.fontSize =
            "13px";

        const categoryLabel =
            document.createElement("strong");

        categoryLabel.textContent =
            "Categoría: ";

        category.appendChild(
            categoryLabel
        );

        category.appendChild(
            document.createTextNode(
                place.primaryTypeDisplayName
            )
        );

        container.appendChild(
            category
        );

    }


    // ==================================
    // DIRECCIÓN
    // ==================================

    if (place.formattedAddress) {

        const address =
            document.createElement("p");

        address.style.margin =
            "8px 0";

        address.style.fontSize =
            "12px";

        const addressLabel =
            document.createElement("strong");

        addressLabel.textContent =
            "Dirección:";

        address.appendChild(
            addressLabel
        );

        address.appendChild(
            document.createElement("br")
        );

        address.appendChild(
            document.createTextNode(
                place.formattedAddress
            )
        );

        container.appendChild(
            address
        );

    }


    // ==================================
    // BOTÓN DE RUTA
    // ==================================

    const routeButton =
        document.createElement("button");


    routeButton.textContent =
        "🚗 Cómo llegar desde mi ubicación";


    routeButton.style.width =
        "100%";

    routeButton.style.padding =
        "10px";

    routeButton.style.marginTop =
        "10px";

    routeButton.style.border =
        "none";

    routeButton.style.borderRadius =
        "6px";

    routeButton.style.background =
        "#2563eb";

    routeButton.style.color =
        "white";

    routeButton.style.cursor =
        "pointer";

    routeButton.style.fontSize =
        "12px";


    // ==================================
    // EVENTO DEL BOTÓN DE RUTA
    // ==================================

    routeButton.addEventListener(
        "click",
        function () {

            console.log(
                "🚗 Botón de ruta presionado"
            );

            console.log(
                "Destino:",
                selectedPlace
                    ?.displayName
                    || "Sin nombre"
            );


            calcularRutaDesdeLugar();

        }
    );


    container.appendChild(
        routeButton
    );


    // ==================================
    // ENLACE A GOOGLE MAPS
    // ==================================

    if (place.googleMapsURI) {

        const linkContainer =
            document.createElement("p");

        linkContainer.style.marginTop =
            "12px";


        const link =
            document.createElement("a");


        link.href =
            place.googleMapsURI;


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.textContent =
            "Ver en Google Maps ↗";


        link.style.fontSize =
            "12px";


        link.style.color =
            "#2563eb";


        linkContainer.appendChild(
            link
        );


        container.appendChild(
            linkContainer
        );

    }


    // ==================================
    // MOSTRAR INFOWINDOW
    // ==================================

    infoWindow.setContent(
        container
    );


    infoWindow.open({

        map: map,

        anchor: marker,

        shouldFocus: false

    });


    // ==================================
    // CENTRAR MAPA EN EL LUGAR
    // ==================================

    if (place.location) {

        map.panTo(
            place.location
        );

    }

}

function limpiarResultados() {

    const resultsList =
        document.getElementById(
            "resultsList"
        );


    resultsList.innerHTML = `

        <p class="no-results">
            Realiza una búsqueda para ver resultados.
        </p>

    `;

}
function mostrarResultados() {

    const resultsList =
        document.getElementById(
            "resultsList"
        );


    resultsList.innerHTML = "";


    if (
        placeResults.length === 0
    ) {

        resultsList.innerHTML = `

            <p class="no-results">
                No se encontraron lugares.
            </p>

        `;

        return;

    }


    placeResults.forEach(
        function(resultado) {

            const place =
                resultado.place;


            const marker =
                resultado.marker;


            const boton =
                document.createElement(
                    "button"
                );


            boton.className =
                "result-item";


            const nombre =
                document.createElement(
                    "span"
                );


            nombre.className =
                "result-name";


            nombre.textContent =
                place.displayName
                ||
                "Lugar sin nombre";


            const categoria =
                document.createElement(
                    "span"
                );


            categoria.className =
                "result-category";


            categoria.textContent =
                place.primaryTypeDisplayName
                ||
                "Lugar";


            const direccion =
                document.createElement(
                    "span"
                );


            direccion.className =
                "result-address";


            direccion.textContent =
                place.formattedAddress
                ||
                "Dirección no disponible";


            boton.appendChild(
                nombre
            );


            boton.appendChild(
                categoria
            );


            boton.appendChild(
                direccion
            );


            // --------------------------
            // CLICK EN RESULTADO
            // --------------------------

            boton.addEventListener(
                "click",
                function() {

                    mostrarPlace(
                        place,
                        marker
                    );

                    map.panTo(
                        place.location
                    );

                    map.setZoom(
                        17
                    );

                }
            );


            resultsList.appendChild(
                boton
            );

        }
    );

}
// ======================================
// FILTRO DE CATEGORÍAS
// ======================================

const botonesCategoria =
    document.querySelectorAll(
        ".category-button"
    );


botonesCategoria.forEach(
    function(boton) {

        boton.addEventListener(
            "click",
            function() {

                // --------------------------
                // Activar botón
                // --------------------------

                botonesCategoria.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                boton.classList.add(
                    "active"
                );


                // --------------------------
                // Obtener datos
                // --------------------------

                const categoria =
                    boton.dataset.category;


                const consulta =
                    boton.dataset.search;


                console.log(
                    "Categoría seleccionada:",
                    categoria
                );


                // --------------------------
                // TODOS
                // --------------------------

                if (
                    categoria === "Todos"
                ) {

                    // Eliminar resultados
                    // de Google Places

                    placeMarkers.forEach(
                        function(marker) {

                            marker.map = null;

                        }
                    );


                    placeMarkers = [];
                    placeResults = [];

                    limpiarResultados();

                    // Mostrar nuestros
                    // marcadores originales

                    markers.forEach(
                        function(marker) {

                            marker.map = map;

                        }
                    );


                    // Actualizar panel

                    selectedName.textContent =
                        "Todos los lugares";

                    selectedCategory.textContent =
                        "Mostrando lugares del sistema.";

                    placeCount.textContent =
                        lugares.length;


                    return;

                }


                // --------------------------
                // CATEGORÍA REAL
                // --------------------------

                searchInput.value =
                    consulta;


                buscarLugar(
                    consulta
                );

            }

        );

    }
);
// ======================================
// MI UBICACIÓN
// ======================================

locationButton.addEventListener(
    "click",
    obtenerUbicacion
);


function obtenerUbicacion() {

    // ----------------------------------
    // Verificar soporte
    // ----------------------------------

    if (
        !navigator.geolocation
    ) {

        alert(
            "Tu navegador no admite geolocalización."
        );

        return;

    }


    // ----------------------------------
    // Estado visual
    // ----------------------------------

    locationButton.textContent =
        "📡 Obteniendo ubicación...";
        cambiarEstado(
            "📡 Obteniendo ubicación..."
        );

    locationButton.disabled = true;


    // ----------------------------------
    // Solicitar ubicación
    // ----------------------------------

    navigator.geolocation.getCurrentPosition(

        function(position) {


            const ubicacion = {

                lat:
                    position.coords.latitude,

                lng:
                    position.coords.longitude

            };
            currentUserLocation = ubicacion;
            cambiarEstado(
                "✅ Ubicación obtenida"
            );
            
            console.log(
                "Ubicación obtenida:",
                ubicacion
            );


            // ------------------------------
            // Centrar mapa
            // ------------------------------

            map.setCenter(
                ubicacion
            );


            map.setZoom(
                17
            );


            // ------------------------------
            // Eliminar marcador anterior
            // ------------------------------

            if (
                userLocationMarker
            ) {

                userLocationMarker.map =
                    null;

            }


            // ------------------------------
            // Crear nuevo marcador
            // ------------------------------

            userLocationMarker =
                new AdvancedMarkerElement({

                    map: map,

                    position: ubicacion,

                    title:
                        "Mi ubicación",

                    gmpClickable: true

                });


            // ------------------------------
            // Evento click
            // ------------------------------

            userLocationMarker.addEventListener(
                "gmp-click",
                function() {

                    infoWindow.setContent(`
                        <div style="
                            font-family: Arial;
                            padding: 5px;
                        ">

                            <strong>
                                📍 Mi ubicación
                            </strong>

                            <p style="
                                margin-top: 8px;
                                font-size: 12px;
                            ">
                                Latitud:
                                ${ubicacion.lat}
                                <br>

                                Longitud:
                                ${ubicacion.lng}
                            </p>

                        </div>
                    `);


                    infoWindow.open({

                        map: map,

                        anchor:
                            userLocationMarker,

                        shouldFocus:
                            false

                    });

                }
            );


            // ------------------------------
            // Actualizar panel
            // ------------------------------

            selectedName.textContent =
                "Mi ubicación";


            selectedCategory.textContent =
                "Ubicación obtenida correctamente.";


            // ------------------------------
            // Restaurar botón
            // ------------------------------

            locationButton.textContent =
                "📍 Mi ubicación";


            locationButton.disabled =
                false;

        },


        function(error) {


            console.error(
                "Error de geolocalización:",
                error
            );


            locationButton.textContent =
                "📍 Mi ubicación";


            locationButton.disabled =
                false;


            switch (
                error.code
            ) {

                case 1:

                    alert(
                        "Permiso de ubicación denegado."
                    );

                    break;


                case 2:

                    alert(
                        "No se pudo determinar tu ubicación."
                    );

                    break;


                case 3:

                    alert(
                        "La solicitud de ubicación tardó demasiado."
                    );

                    break;


                default:

                    alert(
                        "Ocurrió un error al obtener la ubicación."
                    );

            }

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}

// ======================================
// RUTA + DISTANCIA + TIEMPO
// ======================================

async function calcularRutaDesdeLugar() {

    console.log("🚗 Calculando ruta...");
    cambiarEstado(
    "🚗 Calculando ruta..."
);


    // ==================================
    // VERIFICAR ORIGEN
    // ==================================

    if (!currentUserLocation) {

        alert(
            "Primero debes pulsar 'Mi ubicación'."
        );

        return;

    }


    // ==================================
    // VERIFICAR DESTINO
    // ==================================

    if (!selectedPlace) {

        alert(
            "Primero selecciona un lugar."
        );

        return;

    }


    try {

        // ==================================
        // CARGAR ROUTES Y PLACES
        // ==================================

        const [{ Route }, { Place }] =
            await Promise.all([

                google.maps.importLibrary(
                    "routes"
                ),

                google.maps.importLibrary(
                    "places"
                )

            ]);


        console.log(
            "Destino:",
            selectedPlace.displayName
        );


        // ==================================
        // CREAR PLACE PARA ROUTES
        // ==================================

        const destination =
            new Place({

                id: selectedPlace.id

            });


        // ==================================
        // ELIMINAR RUTA ANTERIOR
        // ==================================

        routePolylines.forEach(
            function(polyline) {

                polyline.setMap(null);

            }
        );


        routePolylines = [];


        // ==================================
        // SOLICITUD
        // ==================================

        const request = {

            origin:
                currentUserLocation,

            destination:
                destination,

            travelMode:
                "DRIVING",

            language:
                "es",

            units:
                google.maps.UnitSystem.METRIC,

            fields: [

                "path",

                "distanceMeters",

                "durationMillis"

            ]

        };


        console.log(
            "📡 Enviando solicitud a Routes API..."
        );


        // ==================================
        // CALCULAR RUTA
        // ==================================

        const { routes } =
            await Route.computeRoutes(
                request
            );


        // ==================================
        // VALIDAR RESULTADO
        // ==================================

        if (
            !routes ||
            routes.length === 0
        ) {

            alert(
                "No se encontró una ruta hacia este lugar."
            );

            return;

        }


        const route =
            routes[0];


        console.log(
            "✅ Ruta encontrada"
        );
        cambiarEstado(
            "✅ Ruta calculada"
        );


        // ==================================
        // DIBUJAR RUTA
        // ==================================

        const polylines =
            route.createPolylines();


        polylines.forEach(
            function(polyline) {

                polyline.setMap(map);

                routePolylines.push(
                    polyline
                );

            }
        );


        // ==================================
        // CALCULAR DISTANCIA
        // ==================================

        const distanciaKm =
            (
                route.distanceMeters
                / 1000
            ).toFixed(2);


        // ==================================
        // CALCULAR TIEMPO
        // ==================================

        const minutos =
            Math.max(
                1,
                Math.round(
                    route.durationMillis
                    / 60000
                )
            );


        console.log(
            "📏 Distancia:",
            distanciaKm,
            "km"
        );


        console.log(
            "⏱️ Tiempo:",
            minutos,
            "minutos"
        );


        // ==================================
        // ACTUALIZAR INFORMACIÓN
        // ==================================

        selectedName.textContent =
            selectedPlace.displayName
            || "Destino";


        selectedCategory.textContent =
            "Ruta calculada";


        // ==================================
        // MOSTRAR RESULTADO
        // ==================================

        mostrarInformacionRuta(

            selectedPlace,

            distanciaKm,

            minutos

        );


        // ==================================
        // AJUSTAR MAPA A LA RUTA
        // ==================================

        if (
            route.path &&
            route.path.length > 0
        ) {

            const { LatLngBounds } =
                await google.maps.importLibrary(
                    "core"
                );


            const bounds =
                new LatLngBounds();


            route.path.forEach(
                function(point) {

                    bounds.extend(
                        point
                    );

                }
            );


            // También incluir ubicación
            // del usuario

            bounds.extend(
                currentUserLocation
            );


            map.fitBounds(
                bounds
            );

        }


    }

    catch (error) {

        console.error(
            "❌ Error calculando ruta:",
            error
        );
      cambiarEstado(
            "❌ Error al calcular la ruta"
        );


        alert(
            "No se pudo calcular la ruta. Revisa la consola."
        );
        cambiarEstado(
                "⚠️ No se pudo obtener la ubicación"
            );

    }

}
window.calcularRutaDesdeLugar =
    calcularRutaDesdeLugar;

// ======================================
// MOSTRAR INFORMACIÓN DE RUTA
// ======================================

function mostrarInformacionRuta(
    place,
    distancia,
    minutos
) {

    const resultsList =
        document.getElementById(
            "resultsList"
        );


    resultsList.innerHTML = `

        <div class="route-result">

            <h4>
                🚗 Ruta al destino
            </h4>


            <p class="route-destination">
                ${
                    place.displayName
                    || "Destino"
                }
            </p>


            <div class="route-data">


                <div class="route-data-item">

                    <span>
                        📏 Distancia
                    </span>

                    <strong>
                        ${distancia} km
                    </strong>

                </div>


                <div class="route-data-item">

                    <span>
                        ⏱️ Tiempo estimado
                    </span>

                    <strong>
                        ${minutos} min
                    </strong>

                </div>


            </div>


            <button
                id="clearRouteButton"
                class="clear-route-button"
            >
                ✕ Quitar ruta
            </button>


        </div>

    `;


    // ==================================
    // BOTÓN QUITAR RUTA
    // ==================================

    const clearButton =
        document.getElementById(
            "clearRouteButton"
        );


    clearButton.addEventListener(
        "click",
        limpiarRuta
    );

}
// ======================================
// LIMPIAR RUTA
// ======================================

function limpiarRuta() {

    routePolylines.forEach(
        function(polyline) {

            polyline.setMap(null);

        }
    );


    routePolylines = [];


    selectedName.textContent =
        "Ningún lugar seleccionado";


    selectedCategory.textContent =
        "Selecciona un marcador en el mapa.";


    limpiarResultados();

}
window.limpiarRuta =
    limpiarRuta;
window.calcularRutaDesdeLugar =
    calcularRutaDesdeLugar;
// ======================================
// LIMPIAR RUTA
// ======================================

function limpiarRuta() {

    console.log(
        "🧹 Eliminando ruta..."
    );


    // ----------------------------------
    // Eliminar líneas
    // ----------------------------------

    routePolylines.forEach(
        function(polyline) {

            polyline.setMap(null);

        }
    );


    routePolylines = [];


    // ----------------------------------
    // Restablecer panel
    // ----------------------------------

    selectedName.textContent =
        "Ningún lugar seleccionado";


    selectedCategory.textContent =
        "Selecciona un marcador en el mapa.";


    // ----------------------------------
    // Volver a resultados
    // ----------------------------------

    if (
        typeof mostrarResultados ===
        "function"
    ) {

        mostrarResultados();

    }

}
// ======================================
// ESTADO DEL SISTEMA
// ======================================

function cambiarEstado(mensaje) {

    systemStatus.textContent =
        mensaje;

}