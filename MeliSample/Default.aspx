<%@ Page Language="C#" Inherits="MeliSample.Default" %>
<%@ Reference Control="~/ProductUserControl.ascx" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html>
<head runat="server">
	<title>Meli Sample .NET</title>
	
	<link rel="stylesheet" href="~/css/chico-0.12.2.css" />
	<link rel="stylesheet" href="~/css/chico-mesh.css" />
	
	<style>
	
	.title_h1 {
		background:transparent url('../assets/main.png') 0 0 no-repeat;
		width: 63px;
		height: 36px;
		text-indent: 999px;
		overflow: hidden;
		margin-top: 14px;
		float:left;
	}
	
	.title_h2 {
		margin-top:21px;
		color:#999;
		size:20px;
		font-family: "Lucida Grande", Arial, sans-serif;
		float:left;
	}
	
	</style>
	
</head>

<body>
	
	<h1 class="title_h1"></h1>
	<h2 class="title_h2">Meli Sample</h2>
	
	<div class="ch-box-lite ch-g6-10" style="clear:both">
			<p> Choose a site, select a category and find whatever you like using MeLi .Net SDK and .Net Framework </p>
	</div>
	
	<form id="searchForm" runat="server">
		
		<div class="ch-box-lite ch-g6-10">
			<h2>Search</h2>
			<asp:DropDownList id="DDLsites" runat="server" AutoPostBack="True" onselectedindexchanged="updateCategories" datavaluefield="id" datatextfield="name"/>
			<asp:DropDownList id="DDLcategories" runat="server" datavaluefield="id" datatextfield="name"/>
			<asp:TextBox id="textInput" runat="server" />
	    	<asp:Button id="btnSearch" runat="server" Text="Search" OnClick="btnSearchClicked" CssClass="ch-btn"/>
    	</div>
    	
		<asp:PlaceHolder runat="server" ID="resultsPlaceHolder" />
		
	</form>
	
</body>
</html>
