﻿using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class RefreshToken
{
    public Guid TokenId { get; set; }

    public Guid AccountId { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public int? Status { get; set; }

    public virtual Account Account { get; set; } = null!;
}
