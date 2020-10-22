import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableConfigurable } from './Table';

test('TableConfigurable renders provided data', () => {
    const columns = [
      {
        Header: 'First Col',
        accessor: 'col1'
      },
      {
        Header: 'Second Col',
        accessor: 'col2'
      }
    ]
    const data = [
      {
        col1: 'Mary',
        col2: 'Poppins'
      },
      {
        col1: 'The',
        col2: 'Blight'
      }
    ]
  
    render(
      <TableConfigurable
        data={data}
        columns={columns}
      />
    );
  
    
    const expectToBeInTheDocument = (matcher) => {
      const el = screen.getByText(matcher);
      expect(el).toBeInTheDocument();
    }
  
    expectToBeInTheDocument(/First Col/);
    expectToBeInTheDocument(/Second Col/);
    expectToBeInTheDocument(/Mary/);
    expectToBeInTheDocument(/Poppins/);
    expectToBeInTheDocument(/The/);
    expectToBeInTheDocument(/Blight/);
  }); 
  