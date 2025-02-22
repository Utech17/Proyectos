function agregarGasto(){
    modalGastoForm();
    $('#gastoId').val(0);
    $('#buttonSubmit').val('Enviar');
}

function modalGastoForm(){
    $('#modalGasto').addClass('modal--show');
}

function cerrarModal(){
    $('#modalGasto').removeClass('modal--show');
    $('#modalEliminar').removeClass('modal--show');
    $('#gastoModal').removeClass('modal--show');
}

function cambiarFiltroProyecto( idproyecto ){
    // Filtrar los gastos que pertenecen al proyecto
    $('#filtroCategoria').html('<option value="0">-- Todos --</option>');
    $('#filtroItem').html('<option value="0">-- Todos --</option>');
    if( idproyecto > 0 ){
        // Items relacionados con proyecto
        const idItems = listaPresupuesto.filter(item => item.id_proyecto == idproyecto).map(item =>item.id_item );
        const idCategorias = listaItem.filter(item => idItems.includes(item.id_item)).map(item => item.id_categoria);
        const categoriasUnicas = [...new Set(idCategorias)];
        const lista = categoriasUnicas.map(id_categoria => {
            const categoria = listaCategoria.find(cat => cat.id_categoria === id_categoria);
            return categoria ? { id_categoria: categoria.id_categoria, nombre: categoria.nombre } : null;
        }).filter(categoria => categoria !== null);

        $.each(lista, function(k, c){
            $('#filtroCategoria').append(`<option value="${ c['id_categoria'] }">${ c['nombre'] }</option>`);
        });
    }
    cambiarFiltro();
}

function cambiarFiltroCategoria( idcategoria ){
    // Filtrar los gastos que pertenecen al proyecto
    let idproyecto = $('#filtroProyecto').val();
    $('#filtroItem').html('<option value="0">-- Todos --</option>');
    if( idcategoria > 0 ){
        // Items relacionados con categoria
        const idItems = listaPresupuesto.filter(item => item.id_proyecto == idproyecto).map(item =>item.id_item );
        const lista = listaItem.filter(item => idItems.includes(item.id_item) && item.id_categoria == idcategoria );
        $.each(lista, function(k, c){
            $('#filtroItem').append(`<option value="${ c['id_item'] }">${ c['nombre'] }</option>`);
        });
    }
    cambiarFiltro();
}

function cambiarFiltro(){
    let idproyecto = $('#filtroProyecto').val();
    let idcategoria = $('#filtroCategoria').val();
    let iditem = $('#filtroItem').val();

    // Filtrar por fecha
    let dataFiltro = filtroFecha();
    if (!dataFiltro) return;

    // Filtrar por proyecto e ítems
    dataFiltro = dataFiltro.filter(item => 
        (idproyecto == 0 || item.ID_Proyecto == idproyecto) && 
        (iditem == 0 || item.ID_Item == iditem)
    );

    // Obtener ítems pertenecientes a la categoría seleccionada
    const idItems = dataFiltro.map(item => item.ID_Item);
    const itemCategorias = listaItem.filter(item => 
        idItems.includes(item.id_item) && 
        (idcategoria == 0 || item.id_categoria == idcategoria)
    ).map(item => item.id_item);

    // Filtrar ítems que pertenecen a la categoría
    if (idcategoria > 0) {
        dataFiltro = dataFiltro.filter(item => itemCategorias.includes(item.ID_Item));
    }

    // Presentar datos en la tabla
    let echo = '';
    $.each(dataFiltro, function(k, row){
        let proyectoNombre = listaProyecto[row.ID_Proyecto] || '';
        let itemNombre = listaItem.find(c2 => c2.id_item == row.ID_Item)?.nombre || '';

        echo += `
            <tr>
                <td>${row.Fecha}</td>
                <td>${itemNombre}</td>
                <td>${row.Monto_Gasto}</td>
                <td>${proyectoNombre}</td>
                <td>
                    <a onClick='eliminarGasto(this)' class='btn-rojo' data-id='${row.ID_Gasto}'>
                        <img src='../vista/img/eliminar.png' alt='eliminar'>
                    </a>
                </td>
            </tr>`;
    });

    $('#tabla').DataTable().destroy();
    $('#tablaDataGasto').html(echo);
    $('#tabla').DataTable({});
}

function filtroFecha(){
    let fechaDesde = $('#filtroFechaD').val();
    let fechaHasta = $('#filtroFechaH').val();

    // Verificar si la fecha hasta es mayor que la fecha desde
    if (fechaDesde && fechaHasta && Date.parse(fechaHasta) < Date.parse(fechaDesde)) {
        //alert('La fecha "Hasta" no puede ser menor que la fecha "Desde".');
        $('#filtroFechaH').val('');
        return false;
    }

    // Filtrar listaGasto según las fechas proporcionadas
    let listaFiltrada = listaGasto.filter(gasto => {
        let fechaGasto = Date.parse(gasto.Fecha);
        let cumpleDesde = fechaDesde ? fechaGasto >= Date.parse(fechaDesde) : true;
        let cumpleHasta = fechaHasta ? fechaGasto <= Date.parse(fechaHasta) : true;

        return cumpleDesde && cumpleHasta;
    });

    return listaFiltrada;
}

function eliminarGasto(input) {
    console.log('Eliminar ID:', input.getAttribute('data-id'));
    $('#modalEliminar').addClass('modal--show');
    $('#eliminarId').val(input.getAttribute('data-id'));
}

$(document).ready(function(){
    // Evento doble clic en las filas de la tabla
    $('table').on('dblclick', 'tr', function() {
        // Obtener los datos del gasto de los atributos data
        var fecha = $(this).data('fecha');
        var item = $(this).data('item');
        var monto = $(this).data('monto');
        var proyecto = $(this).data('proyecto');
        var comprobante = $(this).data('comprobante');
        var observacion = $(this).data('observacion');

        // Rellenar el modal con los datos del gasto
        $('#gastoFecha').text(fecha);
        $('#gastoItem').text(item);
        $('#gastoMonto').text(monto);
        $('#gastoProyecto').text(proyecto);
        $('#gastoComprobante').text(comprobante);
        $('#gastoObservacion').text(observacion);

        // Mostrar el modal
        $('#gastoModal').addClass('modal--show');
    });
});

function seleccionarProyecto(idproyecto) {
    if (idproyecto == '' || idproyecto == 0) return;

    const itemsProyecto = listaPresupuesto.filter(proyecto => proyecto.id_proyecto == idproyecto);
    
    // Obtener los id_categorias correspondientes a los id_item del proyecto
    const categoriasProyecto = itemsProyecto.map(proyecto => {
        const item = listaItem.find(i => i.id_item == proyecto.id_item);
        return item ? item.id_categoria : null;
    }).filter(id_categoria => id_categoria !== null);

    // Obtener categorías únicas y sus nombres
    const categoriasUnicas = [...new Set(categoriasProyecto)];
    const listaCategorias = categoriasUnicas.map(id_categoria => {
        const categoria = listaCategoria.find(cat => cat.id_categoria === id_categoria);
        return categoria ? { id_categoria: categoria.id_categoria, nombre: categoria.nombre } : null;
    }).filter(categoria => categoria !== null);

    // Llenar el select de categorías
    $('#idcategoria').empty();
    $('#idcategoria').append('<option value="0">-- Selecciona --</option>');
    $.each(listaCategorias, function(k, c) {
        $('#idcategoria').append(`<option value="${ c.id_categoria }">${ c.nombre }</option>`);
    });

    // Limpiar el select de items
    $('#iditem').empty();
    $('#iditem').append('<option value="0">-- Selecciona --</option>');
}

function seleccionarCategoria(idcategoria) {
    if (idcategoria == '' || idcategoria == 0) return;

    // Filtrar los items por categoría seleccionada
    const itemsCategoria = listaItem.filter(item => item.id_categoria == idcategoria);
    
    // Filtrar los items por el proyecto seleccionado
    const idproyecto = $('#idproyecto').val();
    const itemsProyecto = listaPresupuesto.filter(proyecto => proyecto.id_proyecto == idproyecto)
                                           .map(p => p.id_item);

    const lista = itemsCategoria.filter(item => itemsProyecto.includes(item.id_item));
    
    // Llenar el select de items
    $('#iditem').empty();
    $('#iditem').append('<option value="0">-- Selecciona --</option>');
    $.each(lista, function(k, c) {
        $('#iditem').append(`<option value="${ c.id_item }">${ c.nombre }</option>`);
    });
}

function allowOnlyFloat(evt) {
    // Permitir: Backspace, Delete, Tab, Escape, Enter y .
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(evt.keyCode) !== -1 ||
        // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (evt.keyCode === 65 && (evt.ctrlKey === true || evt.metaKey === true)) ||
        (evt.keyCode === 67 && (evt.ctrlKey === true || evt.metaKey === true)) ||
        (evt.keyCode === 86 && (evt.ctrlKey === true || evt.metaKey === true)) ||
        (evt.keyCode === 88 && (evt.ctrlKey === true || evt.metaKey === true)) ||
        // Permitir: teclas de inicio y fin
        (evt.keyCode >= 35 && evt.keyCode <= 39)) {
        // Dejar funcionar el evento
        return;
    }
    // Asegurarse de que es un número
    if ((evt.shiftKey || (evt.keyCode < 48 || evt.keyCode > 57)) && (evt.keyCode < 96 || evt.keyCode > 105)) {
        evt.preventDefault();
    }
}

function validateFloatInput(input) {
    const value = input.value;
    const regex = /^[+-]?\d+(\.\d+)?$/;
    if (!regex.test(value)) {
        input.setCustomValidity("Por favor, ingrese un número decimal válido.");
    } else {
        input.setCustomValidity("");
    }
}

// Para verificar si existe parametro GET
function existeParametroGet( parametro ) {
    const params = new URLSearchParams(window.location.search);
    return params.has(parametro);
}