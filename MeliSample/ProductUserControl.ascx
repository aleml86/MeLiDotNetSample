<%@ Control Language="C#" Inherits="MeliSample.ProductUserControl" %>


<table class="ch-datagrid">
    <thead>
        <tr>
        	<th scope="col"></th>
            <th scope="col">Title</th>
            <th scope="col">Condition</th>
            <th scope="col">Price</th>
            <th scope="col">Due Date</th>
        </tr>
    </thead>
    <tbody>
		<% foreach(var item in SearchItems) { %>
		<tr>
			<td><img src="<%= item.thumbnail %>" alt="item image" /> </td> 
			
			<td>
			  <a href="ProductDetails.aspx?productID=<%=item.id %>"><%= item.title %></a> 
			</td>
			
			<td> <%= item.condition %> </td>
			
			<% string curr = TransformCurrency(item.currency_id); %>  
			<td> <p><strong class="ch-price"> <%= curr %>  <%= item.price %></strong></p> </td>
			
			<% string endTime = TransformDate(item.stop_time); %> 
			<td> <%= endTime %></td>
		</tr>
		<%}%>
	</tbody>
</table>

There are <%= this.Results %> results of this item.  