
using System;
using System.Web;
using System.Web.UI;
using System.Collections.Generic;

namespace MeliSample
{
	public partial class Response : System.Web.UI.Page
	{
		private MeliService ms;

		protected override void OnLoad (EventArgs e)
		{

			base.OnLoad (e);

			ms = MeliService.GetService ();

			if(Session["isAuth"] == null)
			{
				Session.Add("isAuth",true); 

				string code = Request ["code"].ToString ();

				ms.Authenticate (code);

				UserObject uo = ms.GetUserInfo();

				Session.Add("User",uo);

				List<UserObject> listUsers = new List<UserObject>();

				listUsers.Add(uo);

				grid.DataSource = listUsers;

				grid.DataBind();


			} else {

				string res = Request.RequestContext.ToString();

			}

		}
		/*
		public virtual void btnGoShopping (object sender, EventArgs args)
		{
			//Response.Redirect("/");
		}
		*/
	}
}

