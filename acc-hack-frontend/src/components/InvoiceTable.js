import React, {Component} from 'react';
import DataTable from 'react-data-table-component';

// const data = [{ id: 1, title: 'Conan the Barbarian', year: '1982' },
//               { id: 2, title: 'Some movie2', year: '2002'}];
              
// const columns = [
//   {
//     name: 'Invoice no.',
//     selector: 'title',
//     sortable: true,
//     maxWidth:"200px"
//   },
//   {
//     name: 'Invoice date',
//     selector: 'year',
//     sortable: true,
//     right: true,
//     maxWidth:"200px"
//   },
//   {
//     name: 'Invoice amount',
//     selector: 'year',
//     sortable: true,
//     right: true,
//     maxWidth:"200px"
//   },
//   {
//     name: 'Seller',
//     selector: 'year',
//     sortable: true,
//     right: true,
//     maxWidth:"200px"
//   },
//   {
//     name: 'Buyer',
//     selector: 'year',
//     sortable: true,
//     right: true,
//     maxWidth:"200px"
//   },
// ];

function arrangeHeaders( headers ){
  const newheaders = headers.filter(item => item !== "invoice_number" || item !== "seller_name");
  newheaders.unshift("seller_name");
  newheaders.unshift("invoice_number");

  return newheaders;
}

function CapitalizeHeader( header ){

  var splitstr = header.split('_');
  for (let i = 0; i < splitstr.length; i++) {
    splitstr[i] = splitstr[i].charAt(0).toUpperCase() + splitstr[i].substring(1);    
  }
  return splitstr.join(' ');

}
class InvoiceTable extends Component {
    constructor(props){
      super(props)
      this.state = {
          Header : [],
          Invoice : []
      }
      
    }

    async componentDidMount(){
      try {
        // const res = await fetch('/api/getinvoice');
        // const json = await res.json();
        // const data = json["Items"];
        const data = this.props.invoices;
        const longestObj = data.reduce( function (prev, current) {
          return (Object.keys(prev).length > Object.keys(current).length) ? prev: current
        })
        const headers = Object.keys(longestObj);
        const newheaders = arrangeHeaders( headers );

        const columns = newheaders.map( h =>  ({
          name: CapitalizeHeader(h),
          selector: h,
          sortable: true,
          right: true,
          mminWidth:"200px"
         }));
        console.log(columns);
        console.log(data);
        this.setState({ Header: columns })
        this.setState({ Invoice: data})
      } catch (e) {
        console.error(e);
      }
    }

    render( ) {
        return (
            <DataTable
                title="Invoices"
                columns={this.state.Header}
                data={this.state.Invoice}
                dense={true}
            />
        )
    }
}

export default InvoiceTable;