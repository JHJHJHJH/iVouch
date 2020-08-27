import React, {Component} from 'react';
import DataTable from 'react-data-table-component';

const data = [{ id: 1, title: 'Conan the Barbarian', year: '1982' },
              { id: 2, title: 'Some movie2', year: '2002'}];
              
const columns = [
  {
    name: 'Invoice no.',
    selector: 'title',
    sortable: true,
    maxWidth:"200px"
  },
  {
    name: 'Invoice date',
    selector: 'year',
    sortable: true,
    right: true,
    maxWidth:"200px"
  },
  {
    name: 'Invoice amount',
    selector: 'year',
    sortable: true,
    right: true,
    maxWidth:"200px"
  },
  {
    name: 'Seller',
    selector: 'year',
    sortable: true,
    right: true,
    maxWidth:"200px"
  },
  {
    name: 'Buyer',
    selector: 'year',
    sortable: true,
    right: true,
    maxWidth:"200px"
  },
];

class InvoiceTable extends Component {
    
    render( ) {
        return (
            <DataTable
                title="Invoices"
                columns={columns}
                data={data}
                dense={true}
            />
        )
    }
}

export default InvoiceTable;